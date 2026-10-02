---
description: Từ yêu cầu của user (vd "tạo web job recruitment"), lên plan + flow + danh sách task vào .handoff/PLAN.md cho Antigravity code
argument-hint: <yêu cầu, vd: tạo web job recruitment>
---
Yêu cầu của user: $ARGUMENTS

Bạn là tech lead. Antigravity là dev sẽ code theo plan của bạn (quy trình của nó nằm trong `AGENTS.md`). Bạn KHÔNG code.

1. Đọc codebase hiện có trước: cái gì đã có thì tái sử dụng, plan chỉ chứa phần còn thiếu.
2. Thiếu thông tin quyết định (vd: có frontend không, auth kiểu gì) thì hỏi user tối đa 3 câu. Còn lại tự chọn default hợp lý và ghi vào mục "Giả định".
3. Theo tinh thần Ponytail: chỉ plan MVP, cắt mọi thứ không cần cho bản đầu tiên.
4. Ghi `.handoff/PLAN.md` (ghi đè; xoá các file khác trong `.handoff/`) theo đúng cấu trúc:

```
# <Tên dự án>
## Mục tiêu & phạm vi
Làm: ... | Không làm (để sau): ...
## Giả định
## Kiến trúc
Tech stack, cấu trúc thư mục, module nào đã có / cần thêm.
## Flow
Các luồng chính của từng vai trò (vd: ứng viên tìm job → nộp CV; HR đăng job → duyệt CV). Dùng mermaid khi luồng có rẽ nhánh.
## Data model
Collection/bảng, field chính, quan hệ.
## API / màn hình
Bảng: method, route, ai được gọi, mô tả.
## Tasks
- [ ] T1: <tên>
  - Files: <đường dẫn tạo/sửa>
  - Làm: <cụ thể: hàm, DTO, route, validation>
  - Tiêu chí đạt: <reviewer sẽ kiểm tra gì>
- [ ] T2: ...
```

5. Quy tắc chia task: theo đúng thứ tự phụ thuộc. Mỗi task phải build được độc lập và đủ nhỏ để review trong một lượt (khoảng dưới 300 dòng diff). Task nào dễ sai thì đưa snippet.
6. Cuối cùng tóm tắt plan cho user trong vài dòng, rồi nhắc: commit working tree cho sạch, sau đó gõ `/implement` trong Antigravity.
