import PDFDocument from "pdfkit";

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

export const generateOrderInvoicePdf = async (
    data: IInvoiceData,
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50,
            });

            const chunks: Buffer[] = [];

            doc.on("data", (chunk) => {
                chunks.push(chunk);
            });

            doc.on("end", () => {
                resolve(Buffer.concat(chunks));
            });

            doc.on("error", (error) => {
                reject(error);
            });

            // Header
            doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", {
                align: "center",
            });

            doc.moveDown(0.5);
            doc.fontSize(10).font("Helvetica").text("Jersey Cravings", {
                align: "center",
            });
            doc.text("Premium Jersey Collections", { align: "center" });

            doc.moveDown(1);

            // Horizontal line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

            doc.moveDown(1);

            // Invoice Details - Left Column
            doc.fontSize(11).font("Helvetica-Bold").text("Invoice Information");
            doc.fontSize(10)
                .font("Helvetica")
                .text(`Invoice ID: ${data.invoiceId}`)
                .text(`Order Number: ${data.orderNumber}`)
                .text(
                    `Order Date: ${new Date(data.orderDate).toLocaleDateString()}`,
                )
                .text(
                    `Payment Date: ${new Date(data.paymentDate).toLocaleDateString()}`,
                )
                .text(`Transaction ID: ${data.transactionId}`);

            doc.moveDown(0.8);

            // Customer Information
            doc.fontSize(11)
                .font("Helvetica-Bold")
                .text("Customer Information");
            doc.fontSize(10)
                .font("Helvetica")
                .text(`Name: ${data.customerName}`)
                .text(`Email: ${data.customerEmail}`);

            doc.moveDown(1);

            // Horizontal line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

            doc.moveDown(1);

            // Items Table
            const col1X = 50;
            const col2X = 280;
            const col3X = 380;
            const col4X = 480;

            doc.fontSize(11).font("Helvetica-Bold").text("Order Items", col1X);

            doc.moveDown(0.8);

            // Table Header
            const headerY = doc.y;
            doc.fontSize(9).font("Helvetica-Bold");
            doc.text("Product", col1X, headerY, { width: 230 });
            doc.text("Qty", col2X, headerY);
            doc.text("Price", col3X, headerY);
            doc.text("Total", col4X, headerY, { align: "right" });

            // Separator line
            doc.moveTo(col1X, doc.y).lineTo(545, doc.y).stroke();

            doc.moveDown(0.5);

            // Items
            doc.fontSize(9).font("Helvetica");
            data.items.forEach((item) => {
                const itemY = doc.y;
                doc.text(item.productTitle, col1X, itemY, {
                    width: 230,
                });
                doc.text(item.qty.toString(), col2X, itemY);
                doc.text(`৳ ${item.unitPrice.toFixed(0)}`, col3X, itemY);
                doc.text(`৳ ${item.lineTotal.toFixed(0)}`, col4X, itemY, {
                    align: "right",
                });
                doc.moveDown(1);
            });

            // Separator line
            doc.moveTo(col1X, doc.y).lineTo(545, doc.y).stroke();

            doc.moveDown(1);

            // Summary Table
            const summaryX = 380;

            doc.fontSize(10).font("Helvetica");
            doc.text("Subtotal:", col1X, doc.y, { width: 330 });
            doc.text(`৳ ${data.subtotal.toFixed(0)}`, summaryX, doc.y - 12, {
                align: "right",
            });

            doc.moveDown(0.6);

            if (data.discount > 0) {
                doc.text("Discount:", col1X);
                doc.text(
                    `- ৳ ${data.discount.toFixed(0)}`,
                    summaryX,
                    doc.y - 12,
                    {
                        align: "right",
                    },
                );
                doc.moveDown(0.6);
            }

            if (data.shipping > 0) {
                doc.text("Shipping:", col1X);
                doc.text(
                    `+ ৳ ${data.shipping.toFixed(0)}`,
                    summaryX,
                    doc.y - 12,
                    {
                        align: "right",
                    },
                );
                doc.moveDown(0.6);
            }

            if (data.giftAddon > 0) {
                doc.text("Gift Add-on:", col1X);
                doc.text(
                    `+ ৳ ${data.giftAddon.toFixed(0)}`,
                    summaryX,
                    doc.y - 12,
                    {
                        align: "right",
                    },
                );
                doc.moveDown(0.6);
            }

            doc.moveTo(col1X, doc.y).lineTo(545, doc.y).stroke();

            doc.moveDown(0.6);

            // Total Row
            const totalY = doc.y;
            doc.fontSize(12).font("Helvetica-Bold");
            doc.text("Total Amount", col1X, totalY);
            doc.text(`৳ ${data.totalAmount.toFixed(0)}`, summaryX, totalY, {
                align: "right",
            });

            doc.moveDown(1.5);

            // Payment Status
            doc.fontSize(11).font("Helvetica-Bold").text("Payment Status");
            doc.fontSize(10).font("Helvetica").text("✓ Payment Completed");

            doc.moveDown(1);

            // Footer
            doc.fontSize(9)
                .font("Helvetica")
                .text(
                    "Thank you for your purchase! This is an electronically generated invoice.",
                    {
                        align: "center",
                    },
                );

            doc.text(
                "For support, please contact: support@jerseycravings.com",
                {
                    align: "center",
                },
            );

            doc.text("Payment processed securely through Stripe.", {
                align: "center",
            });

            // End the document
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
