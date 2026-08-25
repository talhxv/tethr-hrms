// The document-shaped view the PDF template renders. Mappers in the owning
// module build this from entities + tenant config — templates never touch
// persistence types, so a schema change can't silently alter a document.

export type InvoicePdfData = {
  readonly sender: {
    readonly name: string;
    readonly address: string;
    readonly email: string;
    readonly phone: string;
  };
  readonly receiver: {
    readonly name: string;
    readonly address: string;
  };
  readonly invoice: {
    readonly number: string;
    readonly issueDate: string;
    readonly dueDate: string;
    readonly billingPeriodStart: string;
    readonly billingPeriodEnd: string;
    readonly currency: string;
    readonly items: readonly {
      readonly name: string;
      readonly description: string;
      readonly quantity: string;
      readonly unitPrice: string;
      readonly total: string;
    }[];
    readonly subTotal: number;
    readonly totalAmount: number;
    readonly totalInWords: string;
    readonly additionalNotes: string | null;
    readonly paymentTerms: string;
    readonly bank: {
      readonly name: string;
      readonly accountName: string;
      readonly accountNumber: string;
    } | null;
  };
};
