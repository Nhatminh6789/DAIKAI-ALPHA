# Máy chủ backend của Daikai trên Fly.io

Máy chủ này là **relay qua WebSocket**: hai người chơi cùng nối vào máy chủ, mọi gói tin của trận đi qua máy chủ.
Nhờ vậy không cần P2P/WebRTC nên không vướng NAT, 4G hay VPN. Ghép đôi bằng mã phòng và ghép rank đều dùng máy chủ này.

Đánh đổi: ping trận = ping của mỗi người tới máy chủ cộng lại. Máy chủ đặt ở Singapore (`sin`), hợp lý cho người chơi Việt Nam.

## Triển khai (làm một lần)
Trong thư mục `peer-server`:
1. Đổi `app = "daikai-peer"` trong `fly.toml` thành tên riêng của bạn.
2. `fly launch --no-deploy --copy-config --name TÊN-APP`
3. `fly deploy`
4. `fly scale count 1`   (chỉ 1 máy, vì 2 người ghép trận phải ở cùng một máy chủ)

Sửa code máy chủ thì chạy lại `fly deploy`. Xem log: `fly logs`.

## Nối game với máy chủ
Cách nhanh để thử, không cần sửa code: mở game kèm địa chỉ máy chủ ở cuối link:

`https://nhatminh6789.github.io/ĐƯỜNG-DẪN-GAME/?relay=wss://TÊN-APP.fly.dev/ws`

Cách cố định: trong `script.js` tìm dòng `const RELAY_URL=` và thay bằng
`const RELAY_URL='wss://TÊN-APP.fly.dev/ws';`
(để trống = game dùng PeerJS P2P như bản cũ), rồi đưa game lên lại GitHub Pages.
Nhớ đưa cả file `relay-client.js` lên cùng chỗ với `index.html`.

## Các trang kiểm tra
- `https://TÊN-APP.fly.dev/` hoặc `/stats`: trạng thái dạng JSON (vùng máy chủ, số người online, trận đang chạy, các ô đang chờ ghép rank).
- `https://TÊN-APP.fly.dev/test`: trang test cho điện thoại. Hiện ping tới máy chủ, có nút tạo phòng / vào phòng bằng mã để thử bắt cặp giữa 2 máy, và bảng "máy chủ đang thấy" cập nhật mỗi 2 giây.

## Test bằng 2 máy (VPN Việt Nam và VPN Singapore)
1. Máy A (VPN Việt Nam) và máy B (VPN Singapore) mở `https://TÊN-APP.fly.dev/test`.
2. Máy A bấm "Tạo phòng", máy B nhập mã rồi bấm "Vào phòng". Xem có hiện "Đã bắt cặp" và ping giữa 2 máy.
3. Cả hai mở game bằng link có `?relay=...`.
   - Thử mã phòng: A vào PVP → Tạo phòng, B nhập mã.
   - Thử ghép rank: cả hai vào Ghép rank. Cùng bậc rank thì ghép ngay; khác bậc thì nới dần sau 12 giây; sau 45 giây không ai thì gặp bot.
4. Trong lúc ghép, mở `/test` ở tab khác để xem mục "Đang ghép rank" và "Trận đang chạy".

## Lưu ý
- `ALLOWED_ORIGINS` trong `fly.toml` phải đúng địa chỉ web game (mặc định `https://nhatminh6789.github.io`; nhiều địa chỉ thì ngăn cách bằng dấu phẩy). Đổi xong thì `fly deploy` lại.
- Máy nhỏ (shared-cpu-1x, 256MB) đủ để thử nghiệm và một ít người chơi. Đông người thì tăng cấu hình bằng `fly scale vm`.
- Hiện chỉ chạy 1 máy chủ ở 1 vùng.
