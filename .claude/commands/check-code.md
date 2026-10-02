---
description: Review code Antigravity vừa viết cho một task trong .handoff/PLAN.md
argument-hint: <task id, vd T3>
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm run build:*), Bash(cd backend && npm run build:*), Bash(cd frontend && npm run build:*)
---
Bạn là Reviewer kiêm Tech Lead. Antigravity vừa code task **$ARGUMENTS** trong `.handoff/PLAN.md`.

## NGUYÊN TẮC REVIEW (TIẾT KIỆM TOKEN & TẬP TRUNG):
⚠️ **TUYỆT ĐỐI KHÔNG ĐỌC TOÀN BỘ `src/`**: Bạn CHỈ ĐƯỢC PHÉP đọc những dòng code mà Antigravity vừa viết hoặc vừa sửa trong task này. Không quét các file khác ngoài phạm vi task.

1. **Đọc đúng phạm vi thay đổi:**
   - Chạy `git status --porcelain` để biết danh sách file vừa đụng vào.
   - Chạy `git diff HEAD` để xem **chính xác các dòng code (+/-)** vừa được thêm hoặc sửa đổi.
   - Đối với các file mới tạo (untracked file) được liệt kê trong mục `Files` của task $ARGUMENTS, chỉ đọc nội dung của chính file mới đó.
2. **Kiểm tra build:**
   - Nếu task thuộc backend: chạy `npm run build` trong thư mục `backend/` (hoặc root nếu không chia folder).
   - Nếu task thuộc frontend: chạy `npm run build` trong thư mục `frontend/`.
3. **Tiêu chí đánh giá:**
   - Đoạn code vừa thêm/sửa có đạt đủ tiêu chí của task $ARGUMENTS không?
   - Có bug logic hay lỗ hổng bảo mật nào trong đoạn diff đó không?
   - Có sửa lan man ra ngoài phạm vi các file được giao trong task không?
   - Có bị over-engineer không (theo luật Ponytail: ngắn gọn, thực dụng, đơn giản nhất)?

Không tự ý sửa file nào. In kết quả theo đúng format sau (dòng đầu tiên bắt buộc):

VERDICT: PASS
hoặc
VERDICT: FAIL
- `file:line` — lỗi gì — sửa thế nào

Chỉ FAIL khi có lỗi thật trong đoạn code vừa sửa (sai plan, bug, build fail, hổng bảo mật, over-engineer rõ ràng). Góp ý nhỏ ghi dưới mục "Gợi ý (không bắt buộc)".
