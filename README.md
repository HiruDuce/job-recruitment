# ITJobs - Website Tuyển Dụng Việc Làm IT (Job Recruitment)

Hệ thống tuyển dụng việc làm IT trực tuyến toàn diện, hiện đại, bảo mật và chuẩn kiến trúc doanh nghiệp. Dự án được phát triển theo mô hình phân tách rõ ràng giữa **Backend (NestJS + MongoDB Mongoose)** và **Frontend (React 19 + Ant Design 5 + ProComponents)**.

---

## 1. Kiến Trúc & Công Nghệ Sử Dụng

### Backend
- **Framework:** NestJS 11 (Modular Architecture, Dependency Injection)
- **Database:** MongoDB với Mongoose ODM 8
- **Authentication & Security:** 
  - Passport Local & JWT Strategy
  - Access Token (ngắn hạn: 15 phút) gửi qua Header Bearer
  - Refresh Token Rotation bảo mật cao (lưu hash SHA-256 trong Database, cấp phát qua HTTP-Only Cookie, chặn tấn công XSS/CSRF)
  - Helmet bảo vệ HTTP headers, CORS cấu hình chuẩn
  - Phân quyền động **Dynamic RBAC Guard** theo từng cặp `(Method, ApiPath)` và gán theo Role
- **Audit & Data Modeling:** Tự động lưu `createdBy`, `updatedBy`, `deletedBy` và hỗ trợ **Soft Delete** toàn hệ thống
- **File & Email Service:**
  - Upload file nội bộ kiểm duyệt định dạng (PDF cho hồ sơ CV, JPG/PNG/WEBP cho logo công ty) và giới hạn 5MB
  - Gửi email thông báo tự động (Nodemailer + Handlebars template) khi trạng thái hồ sơ CV thay đổi
- **API Documentation:** Tích hợp sẵn Swagger UI tại `/swagger`

### Frontend
- **Framework & Bundler:** React 19 + Vite (SWC compiler) + TypeScript
- **UI & Design System:** Ant Design 5 + Ant Design Pro-Components (ProTable, ProForm, ProLayout)
- **Styling:** SCSS Modules + Ant Design Tokens
- **State Management:** Redux Toolkit + Async-Mutex chống trùng lặp request làm mới Token khi gọi song song
- **Routing:** React Router v7
- **Rich Text & Sanitization:** ReactQuill cho bài đăng việc làm & giới thiệu công ty; DOMPurify lọc mã độc XSS

---

## 2. Tài Khoản Mẫu Để Trải Nghiệm (Demo Accounts)

Hệ thống có cơ chế tự động Seed dữ liệu (`SHOULD_INIT=true`) ngay trong lần khởi động đầu tiên với Database sạch:

| Vai Trò (Role) | Email | Mật Khẩu | Quyền Hạn & Mục Đích Trải Nghiệm |
|---|---|---|---|
| **Super Admin** | `admin@itjobs.local` | `admin@123456` | Toàn quyền hệ thống: Quản lý người dùng, phân quyền RBAC, vai trò, công ty, tin tuyển dụng và hồ sơ |
| **Nhà Tuyển Dụng (HR)** | `hr@itjobs.local` | `admin@123456` | Gắn với công ty demo: Đăng tuyển & quản lý Job của công ty, duyệt hồ sơ CV của ứng viên (đổi trạng thái & xem lịch sử) |
| **Ứng Viên (Candidate)** | `user@itjobs.local` | `admin@123456` | Tìm kiếm việc làm, xem chi tiết công ty, nộp hồ sơ CV (PDF), theo dõi trạng thái các công việc đã ứng tuyển |

---

## 3. Hướng Dẫn Cài Đặt & Chạy Local

### Yêu Cầu Môi Trường
- **Node.js:** phiên bản `18.x` hoặc `20.x+`
- **MongoDB:** MongoDB Community Server đang chạy tại `localhost:27017` (hoặc MongoDB Atlas URI)

---

### Bước 1: Khởi Chạy Backend (API Server)

1. Mở terminal và chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```

2. Kiểm tra file cấu hình môi trường `.env`:
   File `backend/.env` đã được cấu hình sẵn mẫu:
   ```env
   PORT=8000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/itjobs

   JWT_ACCESS_SECRET=itjobs_access_secret_key_123456
   JWT_ACCESS_EXPIRE=900
   JWT_REFRESH_SECRET=itjobs_refresh_secret_key_123456
   JWT_REFRESH_EXPIRE=604800

   SHOULD_INIT=true
   ADMIN_EMAIL=admin@itjobs.local
   ADMIN_PASSWORD=admin@123456

   MAIL_HOST=localhost
   MAIL_PORT=1025
   MAIL_USER=
   MAIL_PASSWORD=
   MAIL_FROM="ITJobs" <no-reply@itjobs.local>
   ```

3. Cài đặt các gói phụ thuộc (nếu chưa cài):
   ```bash
   npm install
   ```

4. Chạy Backend ở chế độ Development:
   ```bash
   npm run start:dev
   ```
   - **Backend API URL:** [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
   - **Swagger UI Tài Liệu API:** [http://localhost:8000/swagger](http://localhost:8000/swagger)

---

### Bước 2: Khởi Chạy Frontend (Client & Admin)

1. Mở một terminal mới và chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```

2. Cài đặt các gói phụ thuộc (nếu chưa cài):
   ```bash
   npm install
   ```

3. Chạy Frontend ở chế độ Development:
   ```bash
   npm run dev
   ```

4. Mở trình duyệt và truy cập:
   - **Giao diện Ứng Viên & Trang Chủ:** [http://localhost:5173](http://localhost:5173)
   - **Đăng Nhập:** [http://localhost:5173/login](http://localhost:5173/login)
   - **Trang Quản Trị (dành cho Admin / HR):** [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 4. Các Tính Năng Chính

### Phía Người Dùng (Client Portal)
- **Trang chủ (Home):**
  - Banner giới thiệu việc làm IT chuẩn công nghệ cao
  - Thanh tìm kiếm thông minh đa tiêu chí (Kỹ năng, Địa điểm)
  - Danh sách việc làm IT mới nhất
  - Danh sách công ty công nghệ nổi bật
- **Tìm kiếm & Lọc Việc Làm (Job List):**
  - Bộ lọc đa chiều theo Kỹ năng (CSV/tags), Địa điểm (Hà Nội, TP.HCM, Đà Nẵng...), Cấp bậc (Intern, Fresher, Junior, Middle, Senior)
  - Đồng bộ trạng thái tìm kiếm lên URL Query (hỗ trợ chia sẻ liên kết, F5 giữ nguyên bộ lọc)
  - Phân trang chuẩn UX
- **Chi tiết Việc Làm & Nộp CV (Job Detail & Apply):**
  - Hiển thị đầy đủ thông tin lương (VNĐ), địa điểm, hạn nộp hồ sơ, mô tả chi tiết bài đăng (render an toàn qua DOMPurify)
  - Modal nộp hồ sơ: Kéo thả file CV định dạng PDF (tối đa 5MB)
  - Quy tắc bảo đảm tính toàn vẹn: Mỗi ứng viên chỉ được ứng tuyển 1 lần cho 1 việc làm
- **Danh sách & Chi tiết Công Ty (Company List & Detail):**
  - Tìm kiếm công ty theo tên, xem thông tin trụ sở, giới thiệu chi tiết
  - Liệt kê danh sách các vị trí tuyển dụng đang mở của công ty đó
- **Quản lý Tài Khoản & Lịch sử Nộp CV (My Account):**
  - Xem danh sách toàn bộ CV đã ứng tuyển, trạng thái hiện tại (Chờ duyệt, Đang xem xét, Đã duyệt, Từ chối) và liên kết mở trực tiếp file PDF đã nộp

### Phía Quản Trị (Admin & HR Portal)
- **Bảo mật truy cập (ProtectedRoute & Dynamic Access):**
  - Ứng viên thông thường truy cập `/admin` tự động nhận lỗi 403 Forbidden
  - Menu hiển thị linh hoạt theo module được cấp phép
- **Quản lý Quyền Hạn (Permissions) & Vai Trò (Roles):**
  - Quản lý danh mục quyền `(API Path, Method, Module)`
  - Tạo mới và cập nhật vai trò, phân quyền theo dạng lưới module Collapse + Checkbox Group
  - Bảo vệ vai trò `ADMIN` mặc định không thể xóa
- **Quản lý Người Dùng (Users):**
  - Thêm, sửa, xóa, tìm kiếm người dùng theo tên và email
  - Hỗ trợ chọn vai trò: khi chọn vai trò `HR`, form bắt buộc phải gắn với một `Company` cụ thể
- **Quản lý Công Ty (Companies):**
  - Tải lên logo công ty qua hình thức `picture-card` lưu vào máy chủ
  - Soạn thảo mô tả công ty qua trình soạn thảo Rich Text (ReactQuill)
- **Quản lý Việc Làm (Jobs):**
  - Admin có thể tạo Job cho bất kỳ công ty nào
  - HR chỉ thấy và quản lý các công việc thuộc về công ty của mình (HR Scoping tự động)
  - Chọn thời gian tuyển dụng bằng `ProFormDateRangePicker`
- **Quản lý Hồ Sơ Tuyển Dụng (Resumes):**
  - Xem danh sách hồ sơ ứng viên nộp vào
  - Xem trước và mở liên kết file PDF
  - Đổi trạng thái ứng viên (PENDING → REVIEWING → APPROVED / REJECTED)
  - Tự động ghi nhận lịch sử xử lý (Timeline) bao gồm người cập nhật và thời gian
  - Tự động kích hoạt email thông báo tới ứng viên khi trạng thái thay đổi

---

## 5. Cấu Trúc Dự Án

```
job-recruitment/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication (JWT, Local, Cookies, RBAC Guard)
│   │   ├── users/         # Quản lý người dùng & phân quyền
│   │   ├── roles/         # Vai trò người dùng (ADMIN, HR, NORMAL_USER)
│   │   ├── permissions/   # Danh mục quyền hạn theo endpoint
│   │   ├── companies/     # Quản lý công ty tuyển dụng
│   │   ├── jobs/          # Quản lý tin tuyển dụng IT
│   │   ├── resumes/       # Hồ sơ ứng tuyển & quy trình xét duyệt
│   │   ├── files/         # Upload & lưu trữ tập tin (images, pdf)
│   │   ├── mail/          # Dịch vụ gửi email thông báo & templates HBS
│   │   ├── databases/     # Khởi tạo & Seed dữ liệu mặc định
│   │   └── core/          # BaseSchema, Soft-delete plugin, Paginate, Interceptors
│   ├── .env               # Cấu hình biến môi trường Backend
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components (Header, Footer, JobCard, SearchBar, Access)
│   │   ├── layouts/       # ClientLayout, AdminLayout (ProLayout)
│   │   ├── pages/         # Các trang Client (Home, JobList, JobDetail...) & Admin (User, Role...)
│   │   ├── redux/         # Redux Toolkit store & accountSlice
│   │   ├── config/        # Axios interceptors, API calls, Constants
│   │   └── router.tsx     # Định tuyến ứng dụng React Router v7
│   └── package.json
│
├── .handoff/
│   └── PLAN.md            # Toàn bộ kế hoạch kiến trúc & tiến độ hoàn thành 20 tasks
└── README.md
```
