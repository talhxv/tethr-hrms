import { Injectable } from '@nestjs/common';
import { renderToStaticMarkup } from 'react-dom/server';

import { amountInWords } from '../../../core/pdf/formatting';
import { PdfRendererService } from '../../../core/pdf/pdf-renderer.service';

import { InvoiceLine } from '../entities/invoice-line.entity';
import { Invoice } from '../entities/invoice.entity';
import type { ClientBillingConfig } from '../entities/client-billing-config.entity';

import { InvoicePdfTemplate } from './invoice-pdf.template';
import type { InvoicePdfData } from './invoice-pdf.types';

const pad2 = (value: number): string => String(value).padStart(2, '0');
const money = (value: number): string => (Math.round(value * 100) / 100).toFixed(2);

// Builds Invoify-shaped documents from billing state and renders them through
// the shared headless-browser pipeline. Output is byte-for-byte the layout
// finance already knows — same template structure, fonts, and Tailwind CSS.
@Injectable()
export class InvoicePdfService {
  constructor(private readonly renderer: PdfRendererService) {}

  async renderInvoicePdf(
    invoice: Invoice,
    lines: readonly InvoiceLine[],
    config: ClientBillingConfig,
    groupName: string,
  ): Promise<Buffer> {
    const data = this.toTemplateData(invoice, lines, config, groupName);
    const html = renderToStaticMarkup(InvoicePdfTemplate(data));
    return this.renderer.renderHtmlToPdf(html);
  }

  private toTemplateData(
    invoice: Invoice,
    lines: readonly InvoiceLine[],
    config: ClientBillingConfig,
    groupName: string,
  ): InvoicePdfData {
    const periodEndInclusiveDate = new Date(`${invoice.periodEndExclusive}T00:00:00Z`);
    periodEndInclusiveDate.setUTCDate(periodEndInclusiveDate.getUTCDate() - 1);

    return {
      sender: {
        name: config.senderName ?? invoice.receiverName ?? 'Tethr Pvt. Ltd.',
        address: [config.senderAddress, config.senderEmail, config.senderPhone]
          .filter((part) => part != null && part !== '')
          .join(', '),
        email: config.senderEmail ?? '',
        phone: config.senderPhone ?? '',
      },
      receiver: {
        name: invoice.receiverName ?? groupName,
        address: invoice.receiverAddress ?? '',
      },
      invoice: {
        number: invoice.number ?? 'DRAFT',
        issueDate: invoice.issueDate ?? '',
        dueDate: invoice.dueDate ?? '',
        billingPeriodStart: invoice.periodStart,
        billingPeriodEnd: `${periodEndInclusiveDate.getUTCFullYear()}-${pad2(
          periodEndInclusiveDate.getUTCMonth() + 1,
        )}-${pad2(periodEndInclusiveDate.getUTCDate())}`,
        currency: invoice.currency,
        items: lines.map((line) => ({
          // Sheet convention: person on the name row, what it is beneath; fee
          // rows keep the dash placeholder like the manual sheet always had.
          name: line.employeeName ?? '-',
          description:
            line.monthLabel != null ? `${line.description} (${line.monthLabel})` : line.description,
          quantity: String(Number(line.quantity)),
          unitPrice: money(Number(line.unitPrice)),
          total: money(Number(line.total)),
        })),
        subTotal: Number(invoice.subTotal),
        totalAmount: Number(invoice.totalAmount),
        totalInWords: amountInWords(Number(invoice.totalAmount), invoice.currency),
        additionalNotes: config.bankSwift ? `SWIFT/BIC: ${config.bankSwift}` : null,
        paymentTerms: `Net ${config.paymentTermsNetDays}`,
        bank:
          config.bankName || config.bankAccountName || config.bankAccountNumber
            ? {
                name: config.bankName ?? '',
                accountName: config.bankAccountName ?? '',
                accountNumber: config.bankAccountNumber ?? '',
              }
            : null,
      },
    };
  }
}
