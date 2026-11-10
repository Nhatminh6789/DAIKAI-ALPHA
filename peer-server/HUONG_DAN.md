# Chuyển máy chủ ghép trận sang châu Á

Máy chủ này chỉ lo bước "tìm nhau" (ghép trận, nhập mã phòng). Ping TRONG trận vẫn là đường nối thẳng giữa 2 người chơi.

## Cách 1: Render (Singapore), có gói miễn phí nhưng không ổn định
1. Đưa thư mục `peer-server` lên một repo GitHub (hoặc cả repo game, rồi đặt Root Directory = `peer-server`).
2. Vào render.com, New > Web Service, chọn repo đó.
3. Region: **Singapore**. Build Command: `npm install`. Start Command: `npm start`.
4. Deploy xong bạn có địa chỉ dạng `daikai-peer.onrender.com`.
5. Mở `script.js`, sửa dòng ở đầu file:
   `const PEER_OPTS={host:'daikai-peer.onrender.com',port:443,path:'/',secure:true};`
6. Đưa game lên lại GitHub Pages.

Lưu ý gói miễn phí: máy chủ tự ngủ sau 15 phút không ai dùng, người đầu tiên vào phải chờ nó thức dậy (khoảng nửa phút). Gói trả phí thì luôn chạy.

## Cách 2: VPS ở Singapore hoặc Việt Nam (khoảng 4-6 USD/tháng)
Cài Node 18+, chép thư mục này lên, chạy `npm install && npm start`, đặt Nginx hoặc Caddy phía trước để có HTTPS (bắt buộc, vì game chạy trên https). Rồi điền `PEER_OPTS` như trên.

## Kiểm tra
Mở `https://<địa-chỉ-máy-chủ>/` trên trình duyệt. Thấy chữ JSON có "PeerJS Server" là máy chủ đang chạy.

## Đổi biến môi trường (nếu cần)
- `ALLOWED_ORIGINS`: địa chỉ web game, ngăn cách bằng dấu phẩy. Mặc định `https://nhatminh6789.github.io`.
