import { proxy } from "./app/layout";

export default proxy;
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
