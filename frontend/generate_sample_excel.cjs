const XLSX = require('xlsx');

const data = [
  { "Họ Tên": "Nguyễn Văn A", "Email": "nguyenvana@example.com", "Số điện thoại": "0987654321" },
  { "Họ Tên": "Trần Thị B", "Email": "tranthib@example.com", "Số điện thoại": "0912345678" }
];

const ws = XLSX.utils.json_to_sheet(data);

// Adjust column widths for better UX
const wscols = [
    {wch: 25},
    {wch: 30},
    {wch: 15}
];
ws['!cols'] = wscols;

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "DanhSachKhachHang");
XLSX.writeFile(wb, "public/Mau_Danh_Sach_Khach_Hang.xlsx");

console.log("Sample Excel file generated successfully!");
