export async function toBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}


export async  function decodeBase64Svg(base64String: string): Promise<string> {
    const prefix = 'data:image/svg+xml;base64,';
    if (!base64String.startsWith(prefix)) return base64String;
    const base64Content = base64String.replace(prefix, '');
    const decoded = atob(base64Content);
    return decoded;
}