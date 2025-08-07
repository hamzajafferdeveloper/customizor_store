// Load SvgTemplate and assign parts
export const loadSvgMasktemplate = (template: any) => {
    const container = document.getElementById('svg-container');
    if (container && template) {
        container.innerHTML = template;

        // Ensure SVG root has xmlns:xlink attribute
        const svgEl = container.querySelector('svg');
        if (svgEl && !svgEl.hasAttribute('xmlns:xlink')) {
            svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        }
    }
};


export async function recolorImage(imageUrl: string, color: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const rNew = parseInt(color.slice(1, 3), 16);
            const gNew = parseInt(color.slice(3, 5), 16);
            const bNew = parseInt(color.slice(5, 7), 16);

            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0) {
                    data[i] = rNew;
                    data[i + 1] = gNew;
                    data[i + 2] = bNew;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
    });
}