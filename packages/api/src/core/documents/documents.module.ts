import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { provideTenantScopedRepository } from '../tenancy/tenant-repository.provider';

import { DocumentVersion } from './document-version.entity';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { DOCUMENT_REPOSITORY, DOCUMENT_VERSION_REPOSITORY } from './document.tokens';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentVersion])],
  providers: [
    DocumentService,
    provideTenantScopedRepository(DOCUMENT_REPOSITORY, Document),
    provideTenantScopedRepository(DOCUMENT_VERSION_REPOSITORY, DocumentVersion),
  ],
  exports: [DocumentService],
})
export class DocumentsModule {}
