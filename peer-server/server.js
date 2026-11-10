// Máy chủ ghép trận (signaling) cho game, dùng PeerJS Server.
// Chỉ giúp hai máy tìm thấy nhau; dữ liệu trận vẫn đi thẳng giữa hai người chơi.
const { PeerServer } = require('peer');

const port = Number(process.env.PORT) || 9000;
// Địa chỉ web game của bạn (để trình duyệt được phép kết nối). Đổi nếu bạn đổi tên miền.
const ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://nhatminh6789.github.io').split(',');

PeerServer({
  port,
  path: '/',
  proxied: true,          // bắt buộc khi chạy sau proxy (Render, Fly, Nginx...)
  allow_discovery: false, // không cho liệt kê danh sách người chơi
  corsOptions: { origin: ORIGINS }
});

console.log('PeerServer chạy ở cổng ' + port);
