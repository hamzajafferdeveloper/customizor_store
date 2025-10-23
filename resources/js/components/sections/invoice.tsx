import React from "react";

type Order = {
    user_id: number;
    product_id: number;
    store_id: number | null;
    price: number;
    name: string;
    number: string;
    email: string;
    country: string;
    address: string;
    has_delivery_address: boolean;
    delivery_address?: string;
    payment_status: string;
    file?: string;
};

const OrderInvoice = ({ order }: { order: Order }) => {
    const infoRows = [
        { label: "Order ID", value: order.product_id },
        { label: "Store ID", value: order.store_id ?? "N/A" },
        { label: "Customer Name", value: order.name },
        { label: "Email", value: order.email },
        { label: "Phone", value: order.number },
        { label: "Country", value: order.country },
        { label: "Address", value: order.address },
        ...(order.has_delivery_address
            ? [{ label: "Delivery Address", value: order.delivery_address }]
            : []),
        { label: "Price", value: `$${order.price.toFixed(2)}` },
        { label: "Payment Status", value: order.payment_status.toUpperCase() },
    ];

    const printInvoice = () => {
        window.print();
    };

    return (
        <div className="mx-auto max-w-4xl bg-white shadow-lg rounded-xl p-8 mt-10 print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
                    <p className="text-gray-500 mt-1">Thank you for your order</p>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0 print:hidden">
                    <button
                        onClick={printInvoice}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Print Invoice
                    </button>
                    {order.file && (
                        <a
                            href={`/storage/${order.file}`}
                            target="_blank"
                            className="bg-gray-200 text-gray-900 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                        >
                            View File
                        </a>
                    )}
                </div>
            </div>

            {/* Invoice Info Section */}
            <div id="invoice-content">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    {infoRows.map((row) => (
                        <div
                            key={row.label}
                            className="flex justify-between border border-gray-100 bg-gray-50 rounded-lg p-4 shadow-sm"
                        >
                            <span className="text-gray-500 font-medium">{row.label}</span>
                            <span className="text-gray-900 font-semibold">{row.value}</span>
                        </div>
                    ))}
                </div>

                {/* Product / File Preview */}
                {order.file && (
                    <div className="border-t pt-6 mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Attached File</h2>
                        <div className="h-64 w-full md:w-80 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img
                                src={`/storage/${order.file}`}
                                alt="Product Preview"
                                className="w-full h-full object-contain hover:scale-105 transition-transform"
                            />
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-10 border-t pt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        This invoice was generated automatically — no signature required.
                    </p>
                    <p className="text-gray-700 mt-2 font-medium">
                        Thank you for your business!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderInvoice;
