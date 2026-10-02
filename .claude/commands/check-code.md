---
description: Review code Antigravity vừa viết cho một task trong .handoff/PLAN.md
argument-hint: <task id, vd T3>
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm run build:*)
---
Bạn là reviewer. Antigravity vừa code task **$ARGUMENTS** trong `.handoff/PLAN.md`.

1. Đọc `.handoff/PLAN.md`, tập trung vào task $ARGUMENTS (các phần Kiến trúc/Flow/Data model dùng làm ngữ cảnh).
2. Xem thay đổi: `git status --porcelain` và `git diff HEAD`. Đọc các file mới (untracked) và code xung quanh khi cần.
3. Chạy `npm run build`.
4. Kiểm tra: làm đúng task và đủ tiêu chí đạt; không có bug logic; không có lỗ hổng bảo mật (validation đầu vào, phân quyền); không sửa ngoài phạm vi task; theo convention của codebase; không over-engineer (luật Ponytail trong `AGENTS.md`).

Không sửa file nào. In kết quả theo đúng format sau (dòng đầu tiên bắt buộc):

VERDICT: PASS
hoặc
VERDICT: FAIL
- `file:line` — lỗi gì — sửa thế nào

Chỉ FAIL khi có lỗi thật (sai plan, bug, build fail, bảo mật, over-engineer rõ ràng). Góp ý nhỏ ghi dưới mục "Gợi ý (không bắt buộc)".
