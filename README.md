# ERP Long Do - Cong viec

Phan he Cong viec cho cong ty da chi nhanh, gom API Fastify/MongoDB, web React/Vite va contract Zod dung chung.

## Chay nhanh

1. `pnpm install`
2. `docker compose up -d mongo`
3. `pnpm dev`
4. `pnpm typecheck`
5. `pnpm test`

## Cau truc

- `apps/api`: HTTP API, service va repository MongoDB
- `apps/web`: giao dien React va TanStack Query
- `packages/contracts`: schema Zod va type dung chung

## Tien do

- [x] Khoi tao pnpm workspace va cac package
- [x] Tao khung contracts, API va web
- [x] Hoan thien CRUD, phan quyen, lich su va seed
- [x] Bo sung test nghiep vu va giao dien danh sach/chi tiet
- [ ] Ket noi Mongo repository vao runtime production va them endpoint danh muc du an

## Gia dinh

- JWT trong bai test la token gia lap, payload chua `userId` va `congTyId`.
- Ngay han duoc so sanh theo lich Viet Nam (`Asia/Ho_Chi_Minh`).
- Xoa cong viec la xoa mem; du lieu da hoan thanh khong bi xoa.
