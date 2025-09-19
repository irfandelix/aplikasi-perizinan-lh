import React from 'react';

const placeholderPageStyles = `
    .placeholder-container {
        border: 2px dashed var(--border-color);
        padding: 3rem;
        text-align: center;
        border-radius: 8px;
        margin-top: 2rem;
    }
    .placeholder-container h3 {
        margin-top: 0;
        color: var(--dark-gray);
    }
    @media print {
        .no-print {
            display: none !important;
        }
        .placeholder-container {
            border: none;
            padding: 0;
            margin: 0;
            text-align: center;
        }
    }
`;

function NotaDinasPage() {
    return (
        <div>
            <style>{placeholderPageStyles}</style>
            <div className="placeholder-container">
                <h3>Penambahan menu ini sedang disusun.</h3>
                <p>Fitur untuk mengelola Nota Dinas akan tersedia di sini pada pembaruan selanjutnya.</p>
            </div>
        </div>
    );
}

export default NotaDinasPage;