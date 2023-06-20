import Cookies from "js-cookie";

export function setCookie(
  name: string,
  value: string,
  attributes: Cookies.CookieAttributes | undefined = undefined // expires, path, domain
) {
  return attributes === undefined
    ? Cookies.set(name, value)
    : Cookies.set(name, value, attributes);
}

export function getCookie(name: string) {
  return Cookies.get(name);
}

// ha megadtunk külön attribútumokat akkor deletekor meg kell adni külön
export function removeCookie(
  name: string,
  attributes: Cookies.CookieAttributes | undefined = undefined
) {
  return attributes === undefined
    ? Cookies.remove(name)
    : Cookies.remove(name, attributes);
}

export function getAllCookies() {
  return Cookies.get();
}
