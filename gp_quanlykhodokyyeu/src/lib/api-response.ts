import {NextResponse} from "next/server";

export function ok(data: unknown, status = 200) {
    return NextResponse.json(data, {status});
}

export function badRequest(message = "Bad Request", status = 400) {
    return NextResponse.json({ok: false, message}, {status});
}

export function unauthorized(message = "Unauthorized", status = 401) {
    return NextResponse.json({ok: false, message}, {status});
}

export function forbidden(message = "Forbidden", status = 403) {
    return NextResponse.json({ok: false, message}, {status});
}

export function notFound(message = "Not Found", status = 404) {
    return NextResponse.json({ok: false, message}, {status});
}

export function serverError(message = "Internal Server Error", status = 500) {
    return NextResponse.json({ok: false, message}, {status});
}