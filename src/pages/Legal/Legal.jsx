import { Link } from 'react-router-dom'
import { Notice } from '@/components/ui/card'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

const Contact = () =>
  SUPPORT_EMAIL ? <a className="font-semibold text-brand-700 underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> : <b>[email liên hệ — đặt VITE_SUPPORT_EMAIL]</b>

const pages = {
  privacy: {
    title: 'Chính sách quyền riêng tư',
    body: () => (
      <>
        <h2>Dữ liệu chúng tôi lưu</h2>
        <ul>
          <li><b>Tài khoản:</b> email, tên hiển thị; nếu bạn đăng nhập bằng Google/Facebook thì thêm ảnh đại diện từ tài khoản đó.</li>
          <li><b>Hồ sơ (tuỳ chọn):</b> họ tên, số điện thoại, ngày sinh, nơi ở, giới thiệu ngắn, ảnh đại diện.</li>
          <li><b>Hoạt động:</b> các thẻ (tem) bạn đã nhận, ưu đãi đã đổi, đánh giá bạn viết.</li>
        </ul>
        <h2>Vị trí</h2>
        <p>Chỉ dùng vị trí GPS khi bạn bấm “Dùng vị trí hiện tại” hoặc “Gần tôi”, để chọn khu vực và sắp xếp theo khoảng cách. Chúng tôi không lưu toạ độ GPS của bạn.</p>
        <h2>Cách dùng và chia sẻ</h2>
        <p>Dữ liệu dùng để vận hành ứng dụng: lưu bộ sưu tập, đổi ưu đãi, hiển thị đánh giá (kèm tên hiển thị của bạn). Chúng tôi không bán dữ liệu cá nhân. Dữ liệu được lưu trên Supabase; bản đồ dùng ô bản đồ OpenStreetMap; ứng dụng chạy trên Vercel.</p>
        <h2>Quyền của bạn</h2>
        <p>Bạn có thể sửa hồ sơ ở trang <Link to="/profile">Tài khoản</Link> và yêu cầu xoá dữ liệu theo hướng dẫn ở <Link to="/data-deletion">trang Xoá dữ liệu</Link>.</p>
        <h2>Liên hệ</h2>
        <p><Contact /></p>
      </>
    ),
  },
  terms: {
    title: 'Điều khoản sử dụng',
    body: () => (
      <>
        <h2>Sử dụng dịch vụ</h2>
        <p>TripStamp giúp bạn khám phá địa điểm, quét mã QR tại điểm check-in để nhận thẻ số và đổi ưu đãi từ đối tác. Bạn đồng ý dùng dịch vụ đúng mục đích và không gian lận (ví dụ chia sẻ hoặc tự tạo mã QR để nhận thẻ khi chưa đến địa điểm).</p>
        <h2>Đánh giá</h2>
        <p>Chỉ người đã nhận thẻ của địa điểm mới được đánh giá. Nội dung xúc phạm, spam hoặc sai sự thật có thể bị ẩn hoặc xoá.</p>
        <h2>Ưu đãi</h2>
        <p>Ưu đãi do đối tác cung cấp, có thể thay đổi hoặc hết hạn. Điều kiện cụ thể hiển thị tại trang Ưu đãi.</p>
        <h2>Tài khoản</h2>
        <p>Chúng tôi có thể khoá tài khoản có dấu hiệu lạm dụng. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</p>
        <h2>Liên hệ</h2>
        <p><Contact /></p>
      </>
    ),
  },
  'data-deletion': {
    title: 'Yêu cầu xoá dữ liệu',
    body: () => (
      <>
        <p>Bạn có thể yêu cầu xoá tài khoản và dữ liệu liên quan (hồ sơ, thẻ đã nhận, đánh giá, lịch sử đổi ưu đãi) bất cứ lúc nào.</p>
        <h2>Cách thực hiện</h2>
        <ol>
          <li>Gửi email tới <Contact /> từ đúng địa chỉ email của tài khoản (hoặc ghi rõ email đăng ký).</li>
          <li>Tiêu đề: “Xoá dữ liệu TripStamp”.</li>
          <li>Chúng tôi xác minh và xoá dữ liệu trong thời gian hợp lý, rồi gửi email xác nhận.</li>
        </ol>
        <p>Nếu bạn đăng nhập bằng Facebook hoặc Google, bạn cũng nên gỡ quyền của TripStamp trong phần cài đặt ứng dụng của tài khoản đó.</p>
      </>
    ),
  },
}

export default function Legal({ page }) {
  const { title, body: Body } = pages[page]
  return (
    <article className="mx-auto max-w-2xl space-y-4 py-4">
      <h1 className="text-2xl font-extrabold text-brand-800">{title}</h1>
      <Notice tone="warn">Đây là nội dung mẫu để bạn chỉnh theo thực tế vận hành. Hãy nhờ chuyên gia pháp lý xem lại trước khi dùng cho người dùng thật.</Notice>
      <div className="space-y-3 text-gray-700 [&_a]:font-semibold [&_a]:text-brand-700 [&_a]:underline [&_h2]:pt-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:space-y-1">
        <Body />
      </div>
    </article>
  )
}
