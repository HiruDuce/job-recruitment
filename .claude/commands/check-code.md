---
description: Review code Antigravity vừa viết cho một task trong .handoff/PLAN.md
argument-hint: <task id, vd T3>
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm run build:*), Bash(cd backend && npm run build:*), Bash(cd frontend && npm run build:*)
---
Bạn là Reviewer kiêm Tech Lead. Antigravity vừa code task **$ARGUMENTS** trong `.handoff/PLAN.md`.

1. Đọc `.handoff/PLAN.md`, tập trung vào task $ARGUMENTS (các phần Kiến trúc/Flow/Data model dùng làm ngữ cảnh).
2. Xem thay đổi: `git status --porcelain` và `git diff HEAD`. Đọc các file mới (untracked) và code xung quanh khi cần.
3. Chạy build kiểm tra:
   - Nếu task thuộc backend: chạy `npm run build` trong thư mục `backend/` (hoặc root nếu không chia folder).
   - Nếu task thuộc frontend: chạy `npm run build` trong thư mục `frontend/`.
4. Kiểm tra chất lượng & quy chuẩn:
   - Làm đúng phạm vi task và đủ tiêu chí đạt ghi trong plan.
   - Tuân thủ đúng khuôn mẫu kiến trúc đã định nghĩa trong `handoff.md` (DTO validation, Transform response, Cookie Auth, Dynamic RBAC, Antd Pro components, v.v.).
   - Không có bug logic, không có lỗ hổng bảo mật.
   - Không sửa ngoài phạm vi task.
   - Theo tinh thần Ponytail: đơn giản, ngắn gọn, không over-engineer.

Không tự ý sửa file nào. In kết quả theo đúng format sau (dòng đầu tiên bắt buộc):

VERDICT: PASS
hoặc
VERDICT: FAIL
- `file:line` — lỗi gì — sửa thế nào

Chỉ FAIL khi có lỗi thật (sai plan, bug, build fail, hổng bảo mật, over-engineer rõ ràng). Góp ý nhỏ ghi dưới mục "Gợi ý (không bắt buộc)".
