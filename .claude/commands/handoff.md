---
description: Từ tên/yêu cầu website mới của user, lên plan kiến trúc chuẩn (NestJS + React Antd) + flow + data model + chia task vào .handoff/PLAN.md cho Antigravity code
argument-hint: <yêu cầu website, vd: website đặt phòng khách sạn, website bán khóa học>
---
Yêu cầu của user: $ARGUMENTS

Bạn là Tech Lead. Antigravity là Dev sẽ code theo plan của bạn (quy trình của nó nằm trong `AGENTS.md`). Bạn KHÔNG code.

## 1. KHUÔN MẪU KIẾN TRÚC BẮT BUỘC (MANDATORY ARCHITECTURE BLUEPRINT)
Bất kể website thuộc nghiệp vụ gì, bạn BẮT BUỘC phải tổ chức dự án theo đúng chuẩn cấu trúc và coding pattern sau đây:

### A. Cấu trúc thư mục tổng thể (Fullstack):
- `backend/`: Chứa mã nguồn NestJS Backend.
- `frontend/`: Chứa mã nguồn React + Vite + Ant Design Frontend.

### B. Chuẩn kiến trúc Backend (NestJS + TypeScript):
1. **Mô hình Module:** Mỗi tính năng/nghiệp vụ là 1 module độc lập gồm:
   - `<name>.controller.ts`: Định nghĩa endpoint, gọi service, gắn `@ResponseMessage(...)`.
   - `<name>.service.ts`: Xử lý business logic, query database.
   - `<name>.module.ts`: Khai báo controllers, providers, imports, exports.
   - `dto/`: Chứa các class DTO validation đầu vào (dùng `class-validator`, `class-transformer`).
   - `schemas/`: Chứa Mongoose Schema kế thừa `BaseSchema`.
2. **Cấu trúc core/ chung:**
   - `core/transform.interceptor.ts`: Tự động bọc mọi response trả về theo chuẩn: `{ statusCode, message, data: { ... } }`.
   - `core/base.schema.ts`: Chứa trường audit: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `isDeleted`, `deletedBy`.
   - `core/soft-delete.plugin.ts`: Tự viết plugin soft-delete gọn gàng (~15 dòng), KHÔNG dùng plugin bên thứ 3 cũ.
   - `core/paginate.ts`: Helper phân trang chuẩn `{ meta: { current, pageSize, pages, total }, result: [...] }`.
   - `decorator/customize.ts`: Các custom decorator:
     + `@Public()`: Đánh dấu API công khai, bỏ qua JWT Guard.
     + `@ResponseMessage('...')`: Set thông điệp trả về cho client.
     + `@User()`: Lấy thông tin user đăng nhập từ request.
3. **Authentication & Authorization (Chuẩn bảo mật cao):**
   - Passport Local: Dùng cho `POST /api/v1/auth/login`.
   - Passport JWT: `JwtAuthGuard` gắn toàn cục (Global Guard).
   - Cơ chế Token:
     + Access Token: Thời hạn ngắn (vd 10-15 phút), trả về trong body/header cho frontend.
     + Refresh Token: Thời hạn dài (vd vài ngày/tuần), lưu vào `httpOnly` Cookie để bảo mật chống XSS.
     + Route `GET /api/v1/auth/refresh`: Đọc cookie để cấp lại cặp token mới (Token Rotation).
   - Dynamic RBAC (Phân quyền động):
     + Có bảng `roles` và `permissions`.
     + Mỗi permission lưu cặp `(method, api_path)`.
     + Guard tự động đối chiếu `req.method` và `req.route.path` của API đang gọi với danh sách permissions trong role của user.
4. **Các module nền tảng khác:**
   - Module `files`: Upload file qua Multer (kiểm tra dung lượng và mime type, thiết kế interface để sẵn sàng cắm Cloud Storage S3/R2).
   - Module `mail`: Gửi email template tự động (Handlebars).

### C. Chuẩn kiến trúc Frontend (React + Vite + Ant Design):
1. **Core & Tooling:** Vite + React + TypeScript + SCSS Modules.
2. **UI Framework:** Ant Design 5.x.
   - Trang Admin: Bắt buộc dùng `@ant-design/pro-components` (`ProTable`, `ProForm`, `ModalForm`, `DrawerForm`) để CRUD cực nhanh và chuẩn UX.
   - Trang Client: Giao diện người dùng responsive, đẹp mắt, thân thiện.
3. **Layout & Routing:** React Router
   - Tách biệt 2 layout:
     + Client Layout: Header, Footer, Menu người dùng.
     + Admin Layout: Sidebar, Header, Breadcrumbs, Avatar profile.
   - `ProtectedRoute`: Kiểm tra đăng nhập và quyền hạn trước khi vào các trang Admin.
4. **Auth & HTTP Interceptor:**
   - Axios instance với Interceptor:
     + Đính kèm Access Token vào header `Authorization: Bearer <token>`.
     + Khi gặp mã lỗi `401 Unauthorized`: Tự động gọi API `/auth/refresh` bằng cookie, dùng thư viện `async-mutex` để khóa luồng (tránh race condition khi nhiều request gọi cùng lúc), sau đó retry lại các request ban đầu.
5. **State Management:** Redux Toolkit quản lý state xác thực (user info, tokens, status).
6. **Phân quyền UI:** Component `<Access>` tự động ẩn/hiện các nút bấm (Thêm/Sửa/Xóa/Export) trên giao diện dựa theo permission của user đăng nhập.

---

## 2. QUY CHUẨN THƯ VIỆN & PHIÊN BẢN (LIBRARY CONSTRAINTS & MODERN STACK)
Tech Lead BẮT BUỘC phải chọn đúng danh sách thư viện dưới đây khi lên dependencies trong PLAN.md, đảm bảo hệ thống bền vững lâu dài:

### A. Backend Dependencies:
- **Core:** `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` (NestJS bản 10 hoặc mới nhất). Khuyến khích dùng SWC compiler (`nest start -b swc`).
- **Database:** `mongoose` (v8+) + `@nestjs/mongoose`.
  - ⚠️ **CẤM CÀI:** `soft-delete-plugin-mongoose` (thư viện cũ gây lỗi type/hook). BẮT BUỘC tự viết helper soft-delete trong `core/soft-delete.plugin.ts`.
- **Validation:** `class-validator`, `class-transformer`.
- **Authentication & Security:** `passport`, `passport-jwt`, `passport-local`, `@nestjs/passport`, `@nestjs/jwt`, `cookie-parser`, `helmet`.
  - Khuyến khích dùng `@node-rs/bcrypt` hoặc `bcryptjs` v3 (đã có sẵn types).
- **API Docs:** `@nestjs/swagger` + `swagger-ui-express`.
- **Thư viện thừa KHÔNG CẦN CÀI Ở BE:**
  - Không cài `dotenv` (dùng `@nestjs/config` đã tích hợp sẵn).
  - Không cài `@types/bcryptjs` nếu dùng bcryptjs 3 / @node-rs/bcrypt.
  - Không cài `@types/cron` (`@nestjs/schedule` đã có sẵn).

### B. Frontend Dependencies:
- **Core:** `react` (v18 hoặc v19), `react-dom`, `vite` + `@vitejs/plugin-react-swc`, `typescript`.
  - *(Nếu dùng React 19: Bắt buộc cài kèm `@ant-design/v5-patch-for-react-19` để Antd 5 chạy mượt)*.
- **UI Framework:** `antd` (v5.x mới nhất), `@ant-design/pro-components` (v2.x), `@ant-design/icons`.
  - ⚠️ **LƯU Ý:** Giữ `antd` ở v5, KHÔNG nâng lên Antd 6 vì Pro-components hiện chỉ hỗ trợ tốt nhất trên antd 5.
- **Rich Text Editor:**
  - ⚠️ **CẤM DÙNG `react-quill`** (đã ngừng bảo trì và crash trên React 19).
  - BẮT BUỘC DÙNG: **`react-quill-new`** (bản fork tương thích 100%) hoặc **`@tiptap/react`** (chuẩn editor hiện đại nhất cho React).
- **Routing:** `react-router` / `react-router-dom`.
- **State Management:** `@reduxjs/toolkit` (v2.x) + `react-redux` (v9.x).
- **HTTP & Concurrency:** `axios`, `async-mutex` (xử lý concurrency refresh token).
- **Date & Utility:** `dayjs`, `lodash` (hoặc `lodash-es`).
- **Thư viện thừa KHÔNG CẦN CÀI Ở FE:**
  - Không cài `uuid` (dùng `crypto.randomUUID()` có sẵn trong trình duyệt).
  - Không cài `dotenv` (Vite tự load qua `import.meta.env`).
  - Không cài `@types/react-router-dom` lệch version.

---

## 3. QUY TRÌNH TECH LEAD LÊN PLAN
1. Phân tích yêu cầu website mới của user: Xác định các vai trò (Client, Admin, v.v.), các luồng nghiệp vụ chính, và các thực thể dữ liệu (Entities/Collections).
2. Lập cấu trúc module nghiệp vụ mới nhưng ÁP DỤNG 100% CẤU TRÚC KIẾN TRÚC Ở MỤC 1 VÀ QUY CHUẨN THƯ VIỆN Ở MỤC 2.
3. Ghi đè vào `.handoff/PLAN.md` theo format chuẩn:
   - Mục tiêu & phạm vi
   - Giả định (Dependencies, versions sạch và hiện đại)
   - Kiến trúc (Cây thư mục BE và FE)
   - Flow (Mermaid diagram luồng người dùng)
   - Data model (Các schema & quan hệ)
   - API Specs (Danh sách routes, method, quyền gọi)
   - Tasks: Chia nhỏ thành các task T1, T2... Tn theo thứ tự phụ thuộc chặt chẽ:
     + Backend Core & Setup (Base, Auth, Roles, Permissions).
     + Backend Business Modules (Từng module nghiệp vụ của website).
     + Frontend Base & Layout (Vite, Antd, Axios Mutex, Auth, Layout Client/Admin).
     + Frontend Business Pages (Trang Client và Trang Admin ProTable theo module).
4. Mỗi task phải có:
   - `Files`: Danh sách file tạo/sửa.
   - `Làm`: Mô tả logic, hàm, DTO, validation chi tiết.
   - `Tiêu chí đạt`: Tiêu chuẩn để reviewer kiểm tra và test build.
5. Tóm tắt plan ngắn gọn cho user và thông báo sẵn sàng để Antigravity bắt đầu code.
