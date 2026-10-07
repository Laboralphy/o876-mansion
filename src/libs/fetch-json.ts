export async function fetchJSON<T = unknown>(url: string): Promise<T> {
    try {
        const oRequest = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        };
        const response = await fetch(url, oRequest);
        const oJSON = await response.json();
        if (response.status === 500) {
            throw new Error('Error 500 : internal server error : ' + oJSON.message);
        }
        return oJSON;
    } catch (e) {
        throw new Error('FetchJSON Error while fetching ' + url + ' - ' + e.message);
    }
}

export function putJSON<T = unknown>(url: string, data: unknown): Promise<T> {
    return sendJSON<T>(url, 'PUT', data)
}

export function postJSON<T = unknown>(url: string, data: unknown): Promise<T> {
    return sendJSON<T>(url, 'POST', data)
}

export async function sendJSON<T = unknown>(url: string, method: string, data: unknown): Promise<T> {
    const oRequest: RequestInit = {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    oRequest.body = JSON.stringify(data);
    const response = await fetch(url, oRequest);
    switch (response.status) {
        case 403: {
            throw new Error('Err 403 : forbidden')
        }
        case 404: {
            throw new Error('Err 404 : not found')
        }
        case 500: {
            throw new Error('Err 500 : internal server error')
        }
    }
    const oJSON = await response.json();
    return oJSON;
}


export async function deleteJSON<T = unknown>(url: string): Promise<T> {

    const oRequest = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    };
    const response = await fetch(url, oRequest);
    switch (response.status) {
        case 403: {
            throw new Error('Err 403 : forbidden')
        }
        case 404: {
            throw new Error('Err 404 : not found')
        }
        case 500: {
            throw new Error('Err 500 : internal server error')
        }
    }
    const oJSON = await response.json();
    return oJSON;
}