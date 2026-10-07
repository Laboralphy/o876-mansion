import AbstractFilter from "@/libs/filters/AbstractFilter";

/**
 * @class Link
 * @description this filter links serveral filters.
 * When a filter is over, the next in place is initiated, until all filters are over.
 */
class Link extends AbstractFilter {
    _children: AbstractFilter[];


    constructor(children: AbstractFilter[]) {
        super();
        this._children = children;
    }

    process(): void {
        // the current active child
        let currentChild = this._children.length > 0 ? this._children[0] : null;
        if (currentChild === null) {
            return;
        }
        if (currentChild.over()) {
            currentChild = this._children.shift();
        }
        if (currentChild !== null) {
            currentChild.computeClock(this._nProcessTime);
            currentChild.process();
        }
    }

    render(canvas: HTMLCanvasElement): void {
        if (this._children.length > 0) {
            this._children[0].render(canvas);
        }
    }

    over(): boolean {
        return super.over() || this._children.length === 0;
    }
}

export default Link;