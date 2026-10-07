/**
 * Created by ralphy on 04/09/17.
 */
import Geometry from '@/libs/geometry';

class Point {
    x: number;
    y: number;

	constructor(x: number | { x: number, y: number }, y?: number) {
		if (typeof x === 'object' && ('x' in x) && ('y' in x)) {
			this.x = x.x;
			this.y = x.y;
		} else {
            this.x = x as number;
            this.y = y;
		}
	}

	/**
	 * return the distance between this point and the given point
	 * @param p {Point}
	 * @return {number}
	 */
	distance(p: { x: number, y: number }): number {
		return Geometry.distance(p.x, p.y, this.x, this.y);
	}
}

export default Point;