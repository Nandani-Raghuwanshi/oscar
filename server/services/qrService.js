const QRCode = require('qrcode');

async function generate_qr_code(data) {
    try {
        const qr_data_uri = await QRCode.toDataURL(data);
        return { success: true, qr_data_uri };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

module.exports = { generate_qr_code };
