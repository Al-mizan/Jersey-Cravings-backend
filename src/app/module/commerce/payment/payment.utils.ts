import PDFDocument from "pdfkit";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";
import { Prisma } from "../../../../generated/prisma/client";

export interface IInvoiceData {
    invoiceId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    orderDate: string;
    items: Array<{
        productTitle: string;
        qty: number;
        unitPrice: number;
        lineTotal: number;
    }>;
    subtotal: number;
    discount: number;
    shipping: number;
    giftAddon: number;
    totalAmount: number;
    transactionId: string;
    paymentDate: string;
}

interface IGeneratedInvoiceMeta {
    buffer: Buffer;
    fileName: string;
    secureUrl: string;
    publicId: string;
}

const PAGE_MARGIN = 50;
const CONTENT_WIDTH = 495;

const COLORS = {
    brandDark: "#0F172A",
    brandLight: "#DBEAFE",
    accent: "#1D4ED8",
    textPrimary: "#0F172A",
    textMuted: "#475569",
    border: "#CBD5E1",
    success: "#166534",
    successBg: "#DCFCE7",
    tableHeadBg: "#EFF6FF",
};

const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));

const truncateText = (value: string, maxLength = 58) => {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength - 3)}...`;
};

export const getInvoiceFileName = (orderNumber: string) =>
    `${orderNumber}-receipt-${Date.now()}.pdf`;

export const formatCurrency = (amount: number) =>
    `${amount.toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} BDT`;

const ensurePageSpace = (doc: PDFKit.PDFDocument, minHeight: number) => {
    const pageBottom = doc.page.height - PAGE_MARGIN;

    if (doc.y + minHeight > pageBottom) {
        doc.addPage();
        doc.y = PAGE_MARGIN;
    }
};

const drawDivider = (doc: PDFKit.PDFDocument) => {
    doc.moveTo(PAGE_MARGIN, doc.y)
        .lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();
};

const drawHeader = (doc: PDFKit.PDFDocument, data: IInvoiceData) => {
    doc.save();
    doc.rect(0, 0, doc.page.width, 122).fill(COLORS.brandDark);
    doc.restore();

    doc.fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("Jersey Cravings", PAGE_MARGIN, 30);

    doc.fillColor(COLORS.brandLight)
        .font("Helvetica")
        .fontSize(11)
        .text("Official Payment Receipt", PAGE_MARGIN, 62);

    doc.fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Invoice #${data.invoiceId}`, 350, 34, {
            width: 195,
            align: "right",
        })
        .font("Helvetica")
        .fontSize(10)
        .text(`Order ${data.orderNumber}`, 350, 52, {
            width: 195,
            align: "right",
        })
        .text(`Paid ${formatDateTime(data.paymentDate)}`, 350, 70, {
            width: 195,
            align: "right",
        });

    doc.y = 140;
};

const drawMetadata = (doc: PDFKit.PDFDocument, data: IInvoiceData) => {
    doc.fillColor(COLORS.textPrimary)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Billing Details", PAGE_MARGIN, doc.y);

    doc.moveDown(0.5);

    const leftX = PAGE_MARGIN;
    const rightX = 310;
    const rowHeight = 18;
    const startY = doc.y;

    doc.fillColor(COLORS.textMuted).font("Helvetica").fontSize(10);

    doc.text(`Customer: ${data.customerName}`, leftX, startY);
    doc.text(`Email: ${data.customerEmail}`, leftX, startY + rowHeight);
    doc.text(`Order Date: ${formatDateTime(data.orderDate)}`, leftX, startY + rowHeight * 2);

    doc.text(`Transaction: ${data.transactionId}`, rightX, startY);
    doc.text("Payment Method: Stripe", rightX, startY + rowHeight);

    doc.save();
    doc.roundedRect(rightX, startY + rowHeight * 2 - 2, 150, 22, 8).fill(COLORS.successBg);
    doc.restore();

    doc.fillColor(COLORS.success)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("PAID", rightX + 56, startY + rowHeight * 2 + 4);

    doc.y = startY + rowHeight * 3 + 14;
};

const drawItemsTable = (doc: PDFKit.PDFDocument, data: IInvoiceData) => {
    ensurePageSpace(doc, 80);

    doc.fillColor(COLORS.textPrimary)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Purchased Items", PAGE_MARGIN, doc.y);

    doc.moveDown(0.6);

    const col = {
        product: PAGE_MARGIN + 8,
        qty: 332,
        unit: 390,
        total: 470,
    };

    const headerY = doc.y;
    doc.save();
    doc.roundedRect(PAGE_MARGIN, headerY, CONTENT_WIDTH, 24, 6).fill(COLORS.tableHeadBg);
    doc.restore();

    doc.fillColor(COLORS.accent).font("Helvetica-Bold").fontSize(9);
    doc.text("Product", col.product, headerY + 7, { width: 250 });
    doc.text("Qty", col.qty, headerY + 7, { width: 45, align: "right" });
    doc.text("Unit", col.unit, headerY + 7, { width: 70, align: "right" });
    doc.text("Total", col.total, headerY + 7, { width: 65, align: "right" });

    doc.y = headerY + 32;

    if (data.items.length === 0) {
        doc.fillColor(COLORS.textMuted)
            .font("Helvetica")
            .fontSize(10)
            .text("No line items available", PAGE_MARGIN, doc.y);
        doc.moveDown(0.8);
        return;
    }

    data.items.forEach((item, index) => {
        ensurePageSpace(doc, 22);

        const rowY = doc.y;

        if (index % 2 === 1) {
            doc.save();
            doc.rect(PAGE_MARGIN, rowY - 1, CONTENT_WIDTH, 20).fill("#F8FAFC");
            doc.restore();
        }

        doc.fillColor(COLORS.textPrimary).font("Helvetica").fontSize(9);
        doc.text(truncateText(item.productTitle), col.product, rowY + 5, {
            width: 250,
        });
        doc.text(String(item.qty), col.qty, rowY + 5, {
            width: 45,
            align: "right",
        });
        doc.text(formatCurrency(item.unitPrice), col.unit, rowY + 5, {
            width: 70,
            align: "right",
        });
        doc.text(formatCurrency(item.lineTotal), col.total, rowY + 5, {
            width: 65,
            align: "right",
        });

        doc.y = rowY + 20;
    });

    doc.moveDown(0.3);
    drawDivider(doc);
    doc.moveDown(0.6);
};

const drawSummary = (doc: PDFKit.PDFDocument, data: IInvoiceData) => {
    ensurePageSpace(doc, 150);

    const labelX = 355;
    const valueX = 470;

    const drawRow = (
        label: string,
        value: string,
        options?: {
            bold?: boolean;
            color?: string;
            size?: number;
        },
    ) => {
        const color = options?.color || COLORS.textMuted;
        const size = options?.size || 10;
        const font = options?.bold ? "Helvetica-Bold" : "Helvetica";

        doc.fillColor(color)
            .font(font)
            .fontSize(size)
            .text(label, labelX, doc.y, { width: 90 });

        doc.text(value, valueX, doc.y - 12, {
            width: 75,
            align: "right",
        });

        doc.moveDown(0.45);
    };

    drawRow("Subtotal", formatCurrency(data.subtotal));

    if (data.discount > 0) {
        drawRow("Discount", `- ${formatCurrency(data.discount)}`);
    }

    if (data.shipping > 0) {
        drawRow("Shipping", `+ ${formatCurrency(data.shipping)}`);
    }

    if (data.giftAddon > 0) {
        drawRow("Gift Add-on", `+ ${formatCurrency(data.giftAddon)}`);
    }

    doc.moveDown(0.25);
    drawDivider(doc);
    doc.moveDown(0.45);

    drawRow("Total Paid", formatCurrency(data.totalAmount), {
        bold: true,
        color: COLORS.accent,
        size: 12,
    });

    doc.moveDown(1);
};

const drawFooter = (doc: PDFKit.PDFDocument) => {
    ensurePageSpace(doc, 70);

    drawDivider(doc);
    doc.moveDown(0.8);

    doc.fillColor(COLORS.textMuted)
        .font("Helvetica")
        .fontSize(9)
        .text(
            "Thank you for shopping with Jersey Cravings. This receipt was generated automatically.",
            {
                align: "center",
            },
        )
        .text("Support: support@jerseycravings.com", {
            align: "center",
        });
};

export const generateOrderInvoicePdf = async (
    data: IInvoiceData,
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margin: PAGE_MARGIN,
                bufferPages: true,
            });

            const chunks: Buffer[] = [];

            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (error) => reject(error));

            drawHeader(doc, data);
            drawMetadata(doc, data);
            drawDivider(doc);
            doc.moveDown(0.8);
            drawItemsTable(doc, data);
            drawSummary(doc, data);
            drawFooter(doc);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateAndUploadOrderInvoicePdf = async (
    data: IInvoiceData,
): Promise<IGeneratedInvoiceMeta> => {
    const pdfBuffer = await generateOrderInvoicePdf(data);
    const fileName = getInvoiceFileName(data.orderNumber);
    const cloudinaryResponse = await uploadFileToCloudinary(pdfBuffer, fileName);

    return {
        buffer: pdfBuffer,
        fileName,
        secureUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
    };
};


type TOrderForReceipt = Prisma.OrderGetPayload<{
    include: {
        items: {
            include: {
                product: true;
                variant: true;
            };
        };
        user: true;
        payment: true;
        coupons: {
            include: {
                coupon: true;
            };
        };
    };
}>;

export const formatDateTimeForEmail = (value: Date | string) =>
    new Intl.DateTimeFormat("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));

export const getJsonObject = (value: Prisma.JsonValue | null): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

export const buildInvoicePayload = (
    order: TOrderForReceipt,
    invoiceId: string,
    transactionId: string,
    paidAt: Date,
): IInvoiceData => ({
    invoiceId,
    orderNumber: order.orderNumber,
    customerName: order.user.name || order.user.email,
    customerEmail: order.user.email,
    orderDate: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
        productTitle: item.productTitleSnapshot || item.product.title,
        qty: item.qty,
        unitPrice: item.unitPriceAmount,
        lineTotal: item.lineTotalAmount,
    })),
    subtotal: order.subtotalAmount,
    discount: order.discountAmount,
    shipping: order.shippingAmount,
    giftAddon: order.giftAddonAmount,
    totalAmount: order.totalAmount,
    transactionId,
    paymentDate: paidAt.toISOString(),
});