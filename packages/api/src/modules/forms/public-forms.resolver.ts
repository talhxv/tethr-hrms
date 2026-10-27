import { type FormId, type OrganizationId } from '@hrms/shared';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { FormTokenService } from '../../core/auth/form-token.service';
import { TenantContextService } from '../../core/tenancy/tenant-context.service';

import {
  PrepareFormUploadInput,
  SubmitFormInput,
} from './dto/form.inputs';
import {
  FormSubmissionReceiptView,
  FormUploadView,
  PublicFormView,
} from './dto/form.outputs';
import { toPublicFormView } from './form.mappers';
import { FormsService } from './forms.service';

type GraphqlContext = {
  readonly req?: {
    readonly ip?: string;
    readonly socket?: { readonly remoteAddress?: string };
  };
};

type ResolvedLink = {
  readonly formId: FormId;
  readonly organizationId: OrganizationId;
  readonly refId: string | null;
};

const clientAddress = (context: GraphqlContext): string =>
  context.req?.ip ?? context.req?.socket?.remoteAddress ?? 'unknown';

const looksLikeJwt = (token: string): boolean => token.includes('.');

@Resolver()
export class PublicFormsResolver {
  constructor(
    private readonly forms: FormsService,
    private readonly formTokens: FormTokenService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Query(() => PublicFormView)
  async formByLink(@Args('token') token: string): Promise<PublicFormView> {
    return this.runInLink(token, async (link) =>
      toPublicFormView(await this.forms.getPublicForm(link.formId)),
    );
  }

  @Mutation(() => FormUploadView)
  async prepareFormFileUpload(
    @Args('input') input: PrepareFormUploadInput,
    @Context() context: GraphqlContext,
  ): Promise<FormUploadView> {
    return this.runInLink(input.token, async (link) => {
      const upload = await this.forms.prepareFileUpload({
        formId: link.formId,
        fieldKey: input.fieldKey,
        fileName: input.fileName,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        rateLimitKey: `form-upload:${link.formId}:${clientAddress(context)}`,
      });
      return {
        storageKey: upload.storageKey,
        url: upload.url,
        method: upload.method,
        expiresAt: upload.expiresAt.toISOString(),
        headers: upload.headers.map((header) => ({ name: header.name, value: header.value })),
      };
    });
  }

  @Mutation(() => FormSubmissionReceiptView)
  async submitForm(
    @Args('input') input: SubmitFormInput,
    @Context() context: GraphqlContext,
  ): Promise<FormSubmissionReceiptView> {
    return this.runInLink(input.token, async (link) => {
      const submission = await this.forms.submitForm({
        formId: link.formId,
        data: {
          answers: Object.fromEntries(
            input.answers.map((answer) => [answer.fieldKey, answer.value]),
          ),
          files: (input.files ?? []).map((file) => ({
            fieldKey: file.fieldKey,
            storageKey: file.storageKey,
            fileName: file.fileName,
            contentType: file.contentType,
            sizeBytes: file.sizeBytes,
          })),
          metadata: {
            ip: clientAddress(context),
            ...(link.refId ? { refId: link.refId } : {}),
          },
        },
        rateLimitKey: `form-submit:${link.formId}:${clientAddress(context)}`,
      });
      return { id: submission.id, submittedAt: submission.submittedAt.toISOString() };
    });
  }

  private async resolveToken(token: string): Promise<ResolvedLink> {
    if (looksLikeJwt(token)) {
      const claims = this.formTokens.verify(token);
      return { formId: claims.formId, organizationId: claims.organizationId, refId: claims.refId };
    }
    return this.forms.resolveLink(token);
  }

  private async runInLink<TResult>(
    token: string,
    work: (link: { readonly formId: FormId; readonly refId: string | null }) => Promise<TResult>,
  ): Promise<TResult> {
    const resolved = await this.resolveToken(token);
    return this.tenantContext.run(
      { organizationId: resolved.organizationId, userId: null },
      () => work({ formId: resolved.formId, refId: resolved.refId }),
    );
  }
}
