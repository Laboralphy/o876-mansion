class ManagedElement<E extends HTMLElement = HTMLElement> {
    _element: E;
    _height: number;
    _width: number;
    _x: number;
    _y: number;

    constructor(element: E) {
        this.element = element;
    }


    get element(): E {
        return this._element;
    }

    set element(value: E) {
        this._element = value;
        const r = value.getBoundingClientRect();
        this._width = r.width;
        this._height = r.height;
        this._x = r.x;
        this._y = r.y;
    }

    aspect(): number {
        return this._width / this._height;
    }

    set width(value: number) {
        this._width = value;
        this._element.style.width = (value | 0).toString() + 'px';
    }

    set height(value: number) {
        this._height = value;
        this._element.style.height = (value | 0).toString() + 'px';
    }

    set x(value: number) {
        this._x = value;
        this._element.style.position = 'absolute';
        this._element.style.left = (value | 0).toString() + 'px';
    }

    set y(value: number) {
        this._y = value;
        this._element.style.position = 'absolute';
        this._element.style.top = (value | 0).toString() + 'px';
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    autoStretch(): void {
        const PADDING = 0;
        let h = innerHeight;
        let w = innerWidth;
        const r = (h - PADDING) / w;
        const ch = this.height;
        const cw = this.width;
        const rBase = ch / cw;
        let wf, hf;
        // to avoid screen overflow, we will determine the innermost dimension (either with or height)
        if (r < rBase) { // use the height (innermost)
            h -= PADDING;
            hf = h;
            wf = h * cw / ch;
        } else { // use the width (innermost)
            wf = w;
            hf = w * ch / cw;
        }
        // canvas style is being updated
        this.width = wf;
        this.height = hf;
        this.x = (w - wf) >> 1;
        this.y = (h - hf) >> 1;
    }
}

export default ManagedElement;