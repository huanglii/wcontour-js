//#region src/contour/global/Border.ts
var e = class {
	lineList = [];
	getLineNum() {
		return this.lineList.length;
	}
}, t = class {
	xMin;
	xMax;
	yMin;
	yMax;
	constructor(e, t, n, r) {
		this.xMin = e, this.xMax = t, this.yMin = n, this.yMax = r;
	}
	include(e) {
		return this.xMin <= e.xMin && this.xMax >= e.xMax && this.yMin <= e.yMin && this.yMax >= e.yMax;
	}
}, n = class {
	area;
	extent = new t();
	isOutLine;
	isClockwise;
	pointList = [];
	ijPointList = [];
}, r = class e {
	x;
	y;
	constructor(e = 0, t = 0) {
		this.x = e, this.y = t;
	}
	clone() {
		return new e(this.x, this.y);
	}
}, i = class e {
	id;
	borderIdx;
	bInnerIdx;
	point = new r();
	value;
	clone() {
		let t = new e();
		return t.id = this.id, t.borderIdx = this.borderIdx, t.bInnerIdx = this.bInnerIdx, t.point = this.point, t.value = this.value, t;
	}
}, a = class {
	sPoint = new r();
	point = new r();
	index;
	borderIdx;
}, o = class {
	i;
	j;
	constructor(e, t) {
		this.i = e, this.j = t;
	}
}, s = class {
	value;
	type;
	borderIdx;
	pointList = [];
};
//#endregion
//#region src/contour/utils/uti.ts
function c(e, t) {
	let n = Math.abs(e * 1e-5);
	return Math.abs(e - t) <= n;
}
function l(e, t, n) {
	let r = (t.y - e.y) / (t.x - e.x), i = (r * r * e.x + r * (n.y - e.y) + n.x) / (r * r + 1), a = r * (i - e.x) + e.y;
	return Math.sqrt((n.y - a) * (n.y - a) + (n.x - i) * (n.x - i));
}
function u(e) {
	let n, r, i, a, o, s = e[0];
	for (n = s.x, i = s.x, r = s.y, a = s.y, o = 1; o < e.length; o++) s = e[o], s.x < n && (n = s.x), s.x > i && (i = s.x), s.y < r && (r = s.y), s.y > a && (a = s.y);
	let c = new t();
	return c.xMin = n, c.yMin = r, c.xMax = i, c.yMax = a, c;
}
function d(e, t) {
	let n, r, i, a, o, s, c = e[0];
	for (r = c.x, a = c.x, i = c.y, o = c.y, s = 1; s < e.length; s++) c = e[s], c.x < r && (r = c.x), c.x > a && (a = c.x), c.y < i && (i = c.y), c.y > o && (o = c.y);
	return t.xMin = r, t.yMin = i, t.xMax = a, t.yMax = o, n = (a - r) * (o - i), n;
}
function f(e) {
	let t, n, r = 0, i = 0;
	for (t = 0; t < e.length - 1; t++) n = e[t], t === 0 ? (r = n.y, i = 0) : r < n.y && (r = n.y, i = t);
	let a, o, s, c, l, u;
	return c = i - 1, l = i, u = i + 1, i === 0 && (c = e.length - 2), a = e[c], o = e[l], s = e[u], (s.x - a.x) * (o.y - a.y) - (o.x - a.x) * (s.y - a.y) > 0;
}
function p(e, t) {
	let n = !1, r = e.length;
	if (r < 3) return !1;
	let i = e[r - 1].x, a = e[r - 1].y, o, s, c, l;
	for (let u = 0; u < r; u++) {
		let r = e[u].x, d = e[u].y;
		r > i ? (o = i, c = r, s = a, l = d) : (o = r, c = i, s = d, l = a), r < t.x == t.x <= i && (t.y - s) * (c - o) < (l - s) * (t.x - o) && (n = !n), i = r, a = d;
	}
	return n;
}
function m(e, n, r, i) {
	let a, o, c = [], l, u, m;
	if (e.length === 0) {
		let n = r[0].value, p = r[0].value;
		for (let e of r) e.value > n && (n = e.value), e.value < p && (p = e.value);
		a = new _(), u = i[0].value, u < p ? (n = p, p = u, a.isHighCenter = !0) : u > n && (p = n, n = u, a.isHighCenter = !1), o = new s(), o.type = "Border", o.value = u, c = [];
		for (let e of i) c.push(e.point);
		o.pointList = [], o.pointList.push(...c), o.pointList.length > 0 && (a.isBorder = !0, a.lowValue = p, a.highValue = n, l = new t(), a.area = d(o.pointList, l), a.isClockWise = f(o.pointList), a.extent = l, a.outLine = o, a.holeLines = [], e.push(a));
	}
	e.push(...n);
	let h, g, v = e.length, y;
	for (let t = 1; t < v; t++) if (a = e[t], a.outLine.type === "Close") {
		h = a.extent, m = a.outLine.pointList[0];
		for (let n = t - 1; n >= 0; n--) if (y = e[n], g = y.extent, c = [], c.push(...y.outLine.pointList), p(c, m) && h.xMin > g.xMin && h.yMin > g.yMin && h.xMax < g.xMax && h.yMax < g.yMax) {
			y.isHighCenter ? a.isHighCenter = a.highValue !== y.lowValue : a.isHighCenter = a.lowValue === y.highValue;
			break;
		}
	}
	return e;
}
function h(e, t) {
	for (let n = 0; n < t.length; n++) {
		let r = t[n], i = u(r);
		for (let t = e.length - 1; t >= 0; t--) {
			let n = e[t];
			if (n.extent.include(i)) {
				let e = !0;
				for (let t of r) if (!p(n.outLine.pointList, t)) {
					e = !1;
					break;
				}
				if (e) {
					n.addHole(r);
					break;
				}
			}
		}
	}
}
function g(e) {
	let t = [], n, r;
	for (n = 0; n < e.length; n++) {
		let r = e[n];
		(!r.isBorder || r.isInnerBorder) && (r.holeIndex = 1, t.push(r));
	}
	if (t.length === 0) return e;
	{
		let i = [];
		for (n = 1; n < t.length; n++) {
			let e = t[n];
			for (r = n - 1; r >= 0; r--) {
				let n = t[r];
				if (n.extent.include(e.extent) && p(n.outLine.pointList, e.outLine.pointList[0])) {
					e.holeIndex = n.holeIndex + 1, n.addHole(e);
					break;
				}
			}
		}
		let a = [];
		for (n = 0; n < t.length; n++) t[n].holeIndex === 1 && a.push(t[n]);
		for (n = 0; n < e.length; n++) {
			let t = e[n];
			if (t.isBorder && !t.isInnerBorder) {
				for (r = 0; r < a.length; r++) {
					let e = a[r];
					t.extent.include(e.extent) && p(t.outLine.pointList, e.outLine.pointList[0]) && t.addHole(e);
				}
				i.push(t);
			}
		}
		return i.push(...t), i;
	}
}
//#endregion
//#region src/contour/global/Polygon.ts
var _ = class e {
	isBorder;
	isInnerBorder = !1;
	lowValue;
	highValue;
	isClockWise;
	startPointIdx;
	isHighCenter;
	extent = new t();
	area;
	outLine = new s();
	holeLines = [];
	holeIndex;
	clone() {
		let t = new e();
		return t.isBorder = this.isBorder, t.lowValue = this.lowValue, t.highValue = this.highValue, t.isClockWise = this.isClockWise, t.startPointIdx = this.startPointIdx, t.isHighCenter = this.isHighCenter, t.extent = this.extent, t.area = this.area, t.outLine = this.outLine, t.holeLines = this.holeLines, t.holeIndex = this.holeIndex, t;
	}
	hasHoles() {
		return this.holeLines.length > 0;
	}
	addHole(t) {
		if (t instanceof e) this.holeLines.push(t.outLine);
		else {
			let e = t;
			f(e) && (e = e.reverse());
			let n = new s();
			n.pointList = e, this.holeLines.push(n);
		}
	}
};
//#endregion
//#region src/contour/utils/trace.ts
function v(e, t, n, r, i, a) {
	let o = !0, s, c, l, u;
	return t < n ? e[n][i - 1] === 1 && e[n][i + 1] === 1 ? (s = e[n - 1][i - 1], c = e[n + 1][i], l = e[n + 1][i - 1], s !== 0 && c === 0 || s === 0 && c !== 0 && l !== 0 ? (a[0] = n, a[1] = i - 1) : (a[0] = n, a[1] = i + 1)) : e[n][i - 1] === 1 && e[n + 1][i] === 1 ? (s = e[n + 1][i - 1], c = e[n + 1][i + 1], l = e[n][i - 1], u = e[n][i + 1], s === 0 || c === 0 || l === 0 || u === 0 ? s === 0 && u === 0 || c === 0 && l === 0 ? (a[0] = n, a[1] = i - 1) : (a[0] = n + 1, a[1] = i) : (a[0] = n, a[1] = i - 1)) : e[n][i + 1] === 1 && e[n + 1][i] === 1 ? (s = e[n + 1][i - 1], c = e[n + 1][i + 1], l = e[n][i - 1], u = e[n][i + 1], s === 0 || c === 0 || l === 0 || u === 0 ? s === 0 && u === 0 || c === 0 && l === 0 ? (a[0] = n, a[1] = i + 1) : (a[0] = n + 1, a[1] = i) : (a[0] = n, a[1] = i + 1)) : e[n][i - 1] === 1 ? (a[0] = n, a[1] = i - 1) : e[n][i + 1] === 1 ? (a[0] = n, a[1] = i + 1) : e[n + 1][i] === 1 ? (a[0] = n + 1, a[1] = i) : o = !1 : r < i ? e[n + 1][i] === 1 && e[n - 1][i] === 1 ? (s = e[n + 1][i - 1], c = e[n][i + 1], l = e[n + 1][i + 1], s !== 0 && c === 0 || s === 0 && c !== 0 && l !== 0 ? (a[0] = n + 1, a[1] = i) : (a[0] = n - 1, a[1] = i)) : e[n + 1][i] === 1 && e[n][i + 1] === 1 ? (l = e[n - 1][i], u = e[n + 1][i], s = e[n - 1][i + 1], c = e[n + 1][i + 1], s === 0 || c === 0 || l === 0 || u === 0 ? s === 0 && u === 0 || c === 0 && l === 0 ? (a[0] = n + 1, a[1] = i) : (a[0] = n, a[1] = i + 1) : (a[0] = n + 1, a[1] = i)) : e[n - 1][i] === 1 && e[n][i + 1] === 1 ? (l = e[n - 1][i], u = e[n + 1][i], s = e[n - 1][i + 1], c = e[n + 1][i + 1], s === 0 || c === 0 || l === 0 || u === 0 ? s === 0 && u === 0 || c === 0 && l === 0 ? (a[0] = n - 1, a[1] = i) : (a[0] = n, a[1] = i + 1) : (a[0] = n - 1, a[1] = i)) : e[n + 1][i] === 1 ? (a[0] = n + 1, a[1] = i) : e[n - 1][i] === 1 ? (a[0] = n - 1, a[1] = i) : e[n][i + 1] === 1 ? (a[0] = n, a[1] = i + 1) : o = !1 : t > n ? e[n][i - 1] === 1 && e[n][i + 1] === 1 ? (s = e[n + 1][i - 1], c = e[n - 1][i], l = e[n - 1][i + 1], s !== 0 && c === 0 || s === 0 && c !== 0 && l !== 0 ? (a[0] = n, a[1] = i - 1) : (a[0] = n, a[1] = i + 1)) : e[n][i - 1] === 1 && e[n - 1][i] === 1 ? (s = e[n - 1][i - 1], c = e[n - 1][i + 1], l = e[n][i - 1], u = e[n][i + 1], s === 0 || c === 0 || l === 0 || u === 0 ? s === 0 && u === 0 || c === 0 && l === 0 ? (a[0] = n, a[1] = i - 1) : (a[0] = n - 1, a[1] = i) : (a[0] = n, a[1] = i - 1)) : e[n][i + 1] === 1 && e[n - 1][i] === 1 ? (s = e[n - 1][i - 1], c = e[n - 1][i + 1], l = e[n][i - 1], u = e[n][i + 1], s === 0 || c === 0 || l === 0 || u === 0 ? s === 0 && u === 0 || c === 0 && l === 0 ? (a[0] = n, a[1] = i + 1) : (a[0] = n - 1, a[1] = i) : (a[0] = n, a[1] = i + 1)) : e[n][i - 1] === 1 ? (a[0] = n, a[1] = i - 1) : e[n][i + 1] === 1 ? (a[0] = n, a[1] = i + 1) : e[n - 1][i] === 1 ? (a[0] = n - 1, a[1] = i) : o = !1 : r > i && (e[n + 1][i] === 1 && e[n - 1][i] === 1 ? (s = e[n + 1][i + 1], c = e[n][i - 1], l = e[n - 1][i - 1], s !== 0 && c === 0 || s === 0 && c !== 0 && l !== 0 ? (a[0] = n + 1, a[1] = i) : (a[0] = n - 1, a[1] = i)) : e[n + 1][i] === 1 && e[n][i - 1] === 1 ? (l = e[n - 1][i], u = e[n + 1][i], s = e[n - 1][i - 1], c = e[n + 1][i - 1], s === 0 || c === 0 || l === 0 || u === 0 ? s === 0 && u === 0 || c === 0 && l === 0 ? (a[0] = n + 1, a[1] = i) : (a[0] = n, a[1] = i - 1) : (a[0] = n + 1, a[1] = i)) : e[n - 1][i] === 1 && e[n][i - 1] === 1 ? (l = e[n - 1][i], u = e[n + 1][i], s = e[n - 1][i - 1], c = e[n + 1][i - 1], s === 0 || c === 0 || l === 0 || u === 0 ? s === 0 && u === 0 || c === 0 && l === 0 ? (a[0] = n - 1, a[1] = i) : (a[0] = n, a[1] = i - 1) : (a[0] = n - 1, a[1] = i)) : e[n + 1][i] === 1 ? (a[0] = n + 1, a[1] = i) : e[n - 1][i] === 1 ? (a[0] = n - 1, a[1] = i) : e[n][i - 1] === 1 ? (a[0] = n, a[1] = i - 1) : o = !1), o;
}
function y(e, t, n, r, i, a, o, s, c, l, u, d) {
	let f = !0, p = 0, m = 0, h = 0, g = 0, _ = !0;
	return e < t ? n[t][a] !== -2 && n[t][a + 1] !== -2 ? n[t][a] < n[t][a + 1] ? (p = o[a], m = s[t] + n[t][a] * (s[t + 1] - s[t]), h = t, g = a, n[h][g] = -2, _ = !1) : (p = o[a + 1], m = s[t] + n[t][a + 1] * (s[t + 1] - s[t]), h = t, g = a + 1, n[h][g] = -2, _ = !1) : n[t][a] !== -2 && n[t][a + 1] === -2 ? (p = o[a], m = s[t] + n[t][a] * (s[t + 1] - s[t]), h = t, g = a, n[h][g] = -2, _ = !1) : n[t][a] === -2 && n[t][a + 1] !== -2 ? (p = o[a + 1], m = s[t] + n[t][a + 1] * (s[t + 1] - s[t]), h = t, g = a + 1, n[h][g] = -2, _ = !1) : r[t + 1][a] === -2 ? f = !1 : (p = o[a] + r[t + 1][a] * (o[a + 1] - o[a]), m = s[t + 1], h = t + 1, g = a, r[h][g] = -2, _ = !0) : i < a ? r[t][a] !== -2 && r[t + 1][a] !== -2 ? r[t][a] < r[t + 1][a] ? (p = o[a] + r[t][a] * (o[a + 1] - o[a]), m = s[t], h = t, g = a, r[h][g] = -2, _ = !0) : (p = o[a] + r[t + 1][a] * (o[a + 1] - o[a]), m = s[t + 1], h = t + 1, g = a, r[h][g] = -2, _ = !0) : r[t][a] !== -2 && r[t + 1][a] === -2 ? (p = o[a] + r[t][a] * (o[a + 1] - o[a]), m = s[t], h = t, g = a, r[h][g] = -2, _ = !0) : r[t][a] === -2 && r[t + 1][a] !== -2 ? (p = o[a] + r[t + 1][a] * (o[a + 1] - o[a]), m = s[t + 1], h = t + 1, g = a, r[h][g] = -2, _ = !0) : n[t][a + 1] === -2 ? f = !1 : (p = o[a + 1], m = s[t] + n[t][a + 1] * (s[t + 1] - s[t]), h = t, g = a + 1, n[h][g] = -2, _ = !1) : o[a] < c ? n[t - 1][a] !== -2 && n[t - 1][a + 1] !== -2 ? n[t - 1][a] > n[t - 1][a + 1] ? (p = o[a], m = s[t - 1] + n[t - 1][a] * (s[t] - s[t - 1]), h = t - 1, g = a, n[h][g] = -2, _ = !1) : (p = o[a + 1], m = s[t - 1] + n[t - 1][a + 1] * (s[t] - s[t - 1]), h = t - 1, g = a + 1, n[h][g] = -2, _ = !1) : n[t - 1][a] !== -2 && n[t - 1][a + 1] === -2 ? (p = o[a], m = s[t - 1] + n[t - 1][a] * (s[t] - s[t - 1]), h = t - 1, g = a, n[h][g] = -2, _ = !1) : n[t - 1][a] === -2 && n[t - 1][a + 1] !== -2 ? (p = o[a + 1], m = s[t - 1] + n[t - 1][a + 1] * (s[t] - s[t - 1]), h = t - 1, g = a + 1, n[h][g] = -2, _ = !1) : r[t - 1][a] === -2 ? f = !1 : (p = o[a] + r[t - 1][a] * (o[a + 1] - o[a]), m = s[t - 1], h = t - 1, g = a, r[h][g] = -2, _ = !0) : r[t + 1][a - 1] !== -2 && r[t][a - 1] !== -2 ? r[t + 1][a - 1] > r[t][a - 1] ? (p = o[a - 1] + r[t + 1][a - 1] * (o[a] - o[a - 1]), m = s[t + 1], h = t + 1, g = a - 1, r[h][g] = -2, _ = !0) : (p = o[a - 1] + r[t][a - 1] * (o[a] - o[a - 1]), m = s[t], h = t, g = a - 1, r[h][g] = -2, _ = !0) : r[t + 1][a - 1] !== -2 && r[t][a - 1] === -2 ? (p = o[a - 1] + r[t + 1][a - 1] * (o[a] - o[a - 1]), m = s[t + 1], h = t + 1, g = a - 1, r[h][g] = -2, _ = !0) : r[t + 1][a - 1] === -2 && r[t][a - 1] !== -2 ? (p = o[a - 1] + r[t][a - 1] * (o[a] - o[a - 1]), m = s[t], h = t, g = a - 1, r[h][g] = -2, _ = !0) : n[t][a - 1] === -2 ? f = !1 : (p = o[a - 1], m = s[t] + n[t][a - 1] * (s[t + 1] - s[t]), h = t, g = a - 1, n[h][g] = -2, _ = !1), l[0] = h, l[1] = g, u[0] = p, u[1] = m, d[0] = _, f;
}
function b(e, n, r, i, a) {
	let o = [], c, l, u, m, h, g, v;
	c = [], c.push(...e);
	let y, b, x, S, C = [];
	for (C.length = n.length - 1, g = 0; g < C.length; g++) C[g] = 0;
	let w, T, E, D = 0, O = 0, k = 0, A = [], j, M, N;
	for (T = n.length, g = 0; g < T; g++) {
		if (n[g].id === -1) continue;
		w = g, A.push(n[g]);
		let e = !1;
		if (C[w] < 2) {
			x = n[w], N = x.bInnerIdx, y = [];
			let r = [];
			y.push(x.point), r.push(w), j = x.borderIdx, M = j, w += 1, N += 1, N === a[j] - 1 && (w -= a[j] - 1), E = 0;
			do {
				if (x = n[w], x.id === -1) {
					if (C[w] === 1) break;
					k = x.value, y.push(x.point), C[w] += 1, r.push(w);
				} else {
					if (C[w] === 2) break;
					for (C[w] += 1, r.push(w), l = c[x.id], E === 0 ? (D = l.value, O = l.value, E += 1) : D === O && (l.value > D ? O = l.value : l.value < D && (D = l.value), E += 1), b = [], b.push(...l.pointList), u = b[0], x.point.x === u.x && x.point.y === u.y || b.reverse(), y.push(...b), v = 0; v < n.length; v++) if (v !== w && (S = n[v], S.id === x.id)) {
						w = v, N = S.bInnerIdx, C[w] += 1, r.push(w), M = S.borderIdx, x.borderIdx > 0 && x.borderIdx === S.borderIdx && (e = !0);
						break;
					}
				}
				if (w === g) {
					if (y.length > 0) {
						if (e) {
							let e = !1, t = 0;
							for (let e = 0; e < x.borderIdx; e++) t += a[e];
							let i = t, o = t + a[x.borderIdx], s = i;
							for (let e = i; e < o; e++) if (r.indexOf(e) < 0) {
								s = e;
								break;
							}
							if (p(y, n[s].point) && (e = !0), e) break;
						}
						m = new _(), m.isBorder = !0, m.isInnerBorder = e, m.lowValue = D, m.highValue = O, h = new t(), m.area = d(y, h), m.isClockWise = !0, m.startPointIdx = A.length - 1, m.extent = h, m.outLine.pointList = y, m.outLine.value = D, m.isHighCenter = !0, D === O && k < D && (m.isHighCenter = !1), m.outLine.type = "Border", m.holeLines = [], o.push(m);
					}
					break;
				}
				w += 1, N += 1, j !== M && (j = M), N === a[j] - 1 && (w -= a[j] - 1, N = 0);
			} while (!0);
		}
		if (e = !1, w = g, C[w] < 2) {
			y = [];
			let r = [];
			x = n[w], N = x.bInnerIdx, y.push(x.point), r.push(w), j = x.borderIdx, M = j, w += -1, N += -1, N === -1 && (w += a[j] - 1), E = 0;
			do {
				if (x = n[w], x.id === -1) {
					if (C[w] === 1) break;
					k = x.value, y.push(x.point), r.push(w), C[w] += 1;
				} else {
					if (C[w] === 2) break;
					for (C[w] += 1, r.push(w), l = c[x.id], E === 0 ? (D = l.value, O = l.value, E += 1) : D === O && (l.value > D ? O = l.value : l.value < D && (D = l.value), E += 1), b = [], b.push(...l.pointList), u = b[0], x.point.x === u.x && x.point.y === u.y || b.reverse(), y.push(...b), v = 0; v < n.length; v++) if (v !== w && (S = n[v], S.id === x.id)) {
						w = v, N = S.bInnerIdx, C[w] += 1, r.push(w), M = S.borderIdx, x.borderIdx > 0 && x.borderIdx === S.borderIdx && (e = !0);
						break;
					}
				}
				if (w === g) {
					if (y.length > 0) {
						if (e) {
							let e = !1, t = 0;
							for (let e = 0; e < x.borderIdx; e++) t += a[e];
							let i = t, o = t + a[x.borderIdx], s = i;
							for (let e = i; e < o; e++) if (r.indexOf(e) < 0) {
								s = e;
								break;
							}
							if (p(y, n[s].point) && (e = !0), e) break;
						}
						m = new _(), m.isBorder = !0, m.isInnerBorder = e, m.lowValue = D, m.highValue = O, h = new t(), m.area = d(y, h), m.isClockWise = !1, m.startPointIdx = A.length - 1, m.extent = h, m.outLine.pointList = y, m.outLine.value = D, m.isHighCenter = !0, D === O && k < D && (m.isHighCenter = !1), m.outLine.type = "Border", m.holeLines = [], o.push(m);
					}
					break;
				}
				w += -1, N += -1, j !== M && (j = M), N === -1 && (w += a[j], N = a[j] - 1);
			} while (!0);
		}
	}
	let P = [], F;
	for (g = 0; g < c.length; g++) if (l = c[g], l.type === "Close") {
		for (m = new _(), m.isBorder = !1, m.lowValue = l.value, m.highValue = l.value, h = new t(), m.area = d(l.pointList, h), m.isClockWise = f(l.pointList), m.extent = h, m.outLine = l, m.isHighCenter = !0, m.holeLines = [], F = !1, v = 0; v < P.length; v++) if (m.area > P[v].area) {
			P.splice(v, 0, m), F = !0;
			break;
		}
		F || P.push(m);
	}
	o.length === 0 && (l = new s(), l.type = "Border", l.value = i[0], l.pointList = [], l.pointList.push(...r.lineList[0].pointList), l.pointList.length > 0 && (m = new _(), m.lowValue = l.value, m.highValue = l.value, h = new t(), m.area = d(l.pointList, h), m.isClockWise = f(l.pointList), m.extent = h, m.outLine = l, m.isHighCenter = !1, o.push(m))), o.push(...P);
	let I, L, R = o.length, z;
	for (g = R - 1; g >= 0; g += -1) if (m = o[g], m.outLine.type === "Close") {
		for (I = m.extent, D = m.lowValue, u = m.outLine.pointList[0], v = g - 1; v >= 0; v += -1) if (z = o[v], L = z.extent, O = z.lowValue, b = [], b.push(...z.outLine.pointList), p(b, u) && I.xMin > L.xMin && I.yMin > L.yMin && I.xMax < L.xMax && I.yMax < L.yMax) {
			(D < O || D === O && z.isHighCenter) && (m.isHighCenter = !1);
			break;
		}
	}
	return o;
}
function x(e, t, n, r, i, a, o) {
	let s, c, l, u, d, f, p, m, h = r.length, g = i.length, _ = r[1] - r[0], v = i[1] - i[0], y = a[0], b = a[1];
	if (s = t[y][b], c = t[y][b + 1], l = t[y + 1][b], u = t[y + 1][b + 1], d = s + (l - s) * ((e.y - i[y]) / v), f = c + (u - c) * ((e.y - i[y]) / v), p = d + (f - d) * ((e.x - r[b]) / _), s = n[y][b], c = n[y][b + 1], l = n[y + 1][b], u = n[y + 1][b + 1], d = s + (l - s) * ((e.y - i[y]) / v), f = c + (u - c) * ((e.y - i[y]) / v), m = d + (f - d) * ((e.x - r[b]) / _), o ? (e.x += p, e.y += m) : (e.x -= p, e.y -= m), !(e.x >= r[b] && e.x <= r[b + 1] && e.y >= i[y] && e.y <= i[y + 1])) {
		if (e.x < r[0] || e.x > r[r.length - 1] || e.y < i[0] || e.y > i[i.length - 1]) return !1;
		for (let t = y - 2; t < y + 3; t++) if (t >= 0 && t < g && e.y >= i[t] && e.y <= i[t + 1]) {
			y = t;
			for (let t = b - 2; t < b + 3; t++) if (t >= 0 && t < h && e.x >= r[t] && e.x <= r[t + 1]) {
				b = t;
				break;
			}
			break;
		}
	}
	return a[0] = y, a[1] = b, !0;
}
//#endregion
//#region src/contour/Contour.ts
var S = class u {
	static _endPointList = [];
	_s0;
	_m;
	_n;
	_xs;
	_ys;
	_undefData;
	_s1;
	_borders = [];
	constructor(e, t, n, r) {
		this._s0 = e, this._m = e.length, this._n = e[0].length, this._xs = t, this._ys = n, this._undefData = r, this._s1 = this._tracingDataFlag(), this._borders = this._tracingBorders();
	}
	_tracingDataFlag() {
		let e = [], { _s0: t, _m: n, _n: r, _undefData: i } = this;
		for (let a = 0; a < n; a++) {
			e[a] = [];
			for (let n = 0; n < r; n++) e[a][n] = +!c(t[a][n], i);
		}
		for (let t = 1; t < n - 1; t++) for (let n = 1; n < r - 1; n++) if (e[t][n] === 1) {
			let r = e[t][n - 1], i = e[t][n + 1], a = e[t - 1][n], o = e[t + 1][n], s = e[t - 1][n - 1], c = e[t - 1][n + 1], l = e[t + 1][n - 1], u = e[t + 1][n + 1];
			r > 0 && i > 0 && a > 0 && o > 0 && s > 0 && c > 0 && l > 0 && u > 0 && (e[t][n] = 2), r + i + a + o + s + c + l + u <= 2 && (e[t][n] = 0);
		}
		let a;
		for (;;) {
			a = !1;
			for (let t = 1; t < n - 1; t++) for (let n = 1; n < r - 1; n++) if (e[t][n] === 1) {
				let r = e[t][n - 1], i = e[t][n + 1], o = e[t - 1][n], s = e[t + 1][n], c = e[t - 1][n - 1], l = e[t - 1][n + 1], u = e[t + 1][n - 1], d = e[t + 1][n + 1];
				(r === 0 && i === 0 || o === 0 && s === 0) && (e[t][n] = 0, a = !0), (u === 0 && i === 0 && o === 0 || d === 0 && r === 0 && o === 0 || c === 0 && i === 0 && s === 0 || l === 0 && r === 0 && s === 0) && (e[t][n] = 0, a = !0);
			}
			if (!a) break;
		}
		for (let t = 0; t < r; t++) e[0][t] === 1 && (e[1][t] === 0 ? e[0][t] = 0 : t === 0 ? e[0][t + 1] === 0 && (e[0][t] = 0) : t === r - 1 ? e[0][r - 2] === 0 && (e[0][t] = 0) : e[0][t - 1] === 0 && e[0][t + 1] === 0 && (e[0][t] = 0)), e[n - 1][t] === 1 && (e[n - 2][t] === 0 ? e[n - 1][t] = 0 : t === 0 ? e[n - 1][t + 1] === 0 && (e[n - 1][t] = 0) : t === r - 1 ? e[n - 1][r - 2] === 0 && (e[n - 1][t] = 0) : e[n - 1][t - 1] === 0 && e[n - 1][t + 1] === 0 && (e[n - 1][t] = 0));
		for (let t = 0; t < n; t++) e[t][0] === 1 && (e[t][1] === 0 ? e[t][0] = 0 : t === 0 ? e[t + 1][0] === 0 && (e[t][0] = 0) : t === n - 1 ? e[n - 2][0] === 0 && (e[t][0] = 0) : e[t - 1][0] === 0 && e[t + 1][0] === 0 && (e[t][0] = 0)), e[t][r - 1] === 1 && (e[t][r - 2] === 0 ? e[t][r - 1] = 0 : t === 0 ? e[t + 1][r - 1] === 0 && (e[t][r - 1] = 0) : t === n - 1 ? e[n - 2][r - 1] === 0 && (e[t][r - 1] = 0) : e[t - 1][r - 1] === 0 && e[t + 1][r - 1] === 0 && (e[t][r - 1] = 0));
		return e;
	}
	_tracingBorders() {
		let { _s1: t, _m: i, _n: a, _xs: s, _ys: c } = this, l = [], u = [];
		for (let e = 0; e < i + 2; e++) {
			u[e] = [];
			for (let n = 0; n < a + 2; n++) e === 0 || e === i + 1 || n === 0 || n === a + 1 ? u[e][n] = 0 : u[e][n] = t[e - 1][n - 1];
		}
		let m = [];
		for (let e = 0; e < i + 2; e++) {
			m[e] = [];
			for (let t = 0; t < a + 2; t++) if (u[e][t] === 1) {
				let n = u[e][t - 1], r = u[e][t + 1], i = u[e - 1][t], a = u[e + 1][t], o = u[e - 1][t - 1], s = u[e - 1][t + 1], c = u[e + 1][t - 1], l = u[e + 1][t + 1];
				n === 1 && r === 1 && i === 1 && a === 1 && (o === 0 && l === 0 || s === 0 && c === 0) ? m[e][t] = 2 : m[e][t] = 1;
			} else m[e][t] = 0;
		}
		for (let e = 1; e < i + 1; e++) for (let t = 1; t < a + 1; t++) if (u[e][t] === 1) {
			let i = [], a = [];
			i.push(new r(s[t - 1], c[e - 1])), a.push(new o(e - 1, t - 1));
			let f = 0, p = 0, h = e, g = t, _ = h, y = -1;
			for (;;) {
				let n = [];
				if (n[0] = f, n[1] = p, v(u, _, h, y, g, n)) f = n[0], p = n[1], _ = h, y = g, h = f, g = p, m[f][p] = m[f][p] - 1, m[f][p] === 0 && (u[f][p] = 3);
				else break;
				if (i.push(new r(s[p - 1], c[f - 1])), a.push(new o(f - 1, p - 1)), f === e && p === t) break;
			}
			if (m[e][t] = m[e][t] - 1, m[e][t] === 0 && (u[e][t] = 3), i.length > 1) {
				let e = new n();
				e.area = d(i, e.extent), e.isOutLine = !0, e.isClockwise = !0, e.pointList = i, e.ijPointList = a, l.push(e);
			}
		}
		let h = [];
		for (let e = 1; e < l.length; e++) {
			let t = l[e];
			for (let n = 0; n < e; n++) {
				let r = l[e];
				if (t.area > r.area) {
					l.splice(e, 1), l.splice(n, 0, t);
					break;
				}
			}
		}
		let g;
		if (l.length === 1) {
			let t = l[0];
			f(t.pointList) || (t.pointList = t.pointList.reverse(), t.ijPointList.reverse()), t.isClockwise = !0, g = [], g.push(t);
			let n = new e();
			n.lineList = g, h.push(n);
		} else for (let t = 0; t < l.length && t !== l.length; t++) {
			let n = l[t];
			f(n.pointList) || (n.pointList.reverse(), n.ijPointList.reverse()), n.isClockwise = !0, g = [], g.push(n);
			for (let e = t + 1; e < l.length && e !== l.length; e++) {
				let r = l[t];
				if (r.extent.xMin > n.extent.xMin && r.extent.xMax < n.extent.xMax && r.extent.yMin > n.extent.yMin && r.extent.yMax < n.extent.yMax) {
					let t = r.pointList[0];
					p(n.pointList, t) && (r.isOutLine = !1, f(r.pointList) && (r.pointList.reverse(), r.ijPointList.reverse()), r.isClockwise = !1, g.push(r), l.splice(e, 1), --e);
				}
			}
			let r = new e();
			r.lineList = g, h.push(r);
		}
		return h;
	}
	tracingContourLines(e) {
		let { _s0: t, _s1: n, _xs: r, _ys: i, _m: a, _n: o, _borders: s, _undefData: l } = this, d = [], f, m = e[0] * 1e-5;
		m === 0 && (m = 1e-5);
		for (let e = 0; e < a; e++) for (let n = 0; n < o; n++) c(t[e][n], l) || (t[e][n] = t[e][n] + m);
		let h = [], g = [];
		h[0] = [], h[1] = [], g[0] = [], g[1] = [];
		for (let e = 0; e < a; e++) {
			h[0][e] = [], h[1][e] = [], g[0][e] = [], g[1][e] = [];
			for (let t = 0; t < o; t++) t < o - 1 && (h[0][e][t] = -1, h[1][e][t] = -1), e < a - 1 && (g[0][e][t] = -1, g[1][e][t] = -1);
		}
		let _, v, y, b, x;
		for (let e = 0; e < s.length; e++) {
			let t = s[e];
			for (let n = 0; n < t.getLineNum(); n++) {
				let r = t.lineList[n].ijPointList;
				for (_ = 0; _ < r.length - 1; _++) b = r[_], x = r[_ + 1], b.i === x.i ? (v = b.i, y = Math.min(b.j, x.j), h[0][v][y] = e, x.j > b.j ? h[1][v][y] = 1 : h[1][v][y] = 0) : (y = b.j, v = Math.min(b.i, x.i), g[0][v][y] = e, x.i > b.i ? g[1][v][y] = 0 : g[1][v][y] = 1);
			}
		}
		let S = [], C = [], w, T;
		for (T = 0; T < e.length; T++) {
			w = e[T];
			for (let e = 0; e < a; e++) {
				S[e] = [], C[e] = [];
				for (let r = 0; r < o; r++) r < o - 1 && (n[e][r] !== 0 && n[e][r + 1] !== 0 && (t[e][r] - w) * (t[e][r + 1] - w) < 0 ? S[e][r] = (w - t[e][r]) / (t[e][r + 1] - t[e][r]) : S[e][r] = -2), e < a - 1 && (n[e][r] !== 0 && n[e + 1][r] !== 0 && (t[e][r] - w) * (t[e + 1][r] - w) < 0 ? C[e][r] = (w - t[e][r]) / (t[e + 1][r] - t[e][r]) : C[e][r] = -2);
			}
			f = u.isoline_UndefData(t, r, i, w, S, C, h, g, d.length);
			for (let e of f) d.push(e);
		}
		for (let e = 0; e < s.length; e++) {
			let t = s[e].lineList[0];
			for (let n = 0; n < d.length; n++) {
				let r = d[n];
				if (r.type === "Close") {
					let n = r.pointList[0];
					p(t.pointList, n) && (r.borderIdx = e);
				}
				d.splice(n, 1), d.splice(n, 0, r);
			}
		}
		return d;
	}
	tracingPolygons(e, n) {
		let r = this._s0, a = this._borders, o = [], s = [], c, l = [], p, m, v, y, x, S, C, w = [], T = [], E, D, O, k = 0, A;
		for (S = 0; S < a.length; S++) {
			if (T = [], l = [], w = [], o = [], m = a[S], v = m.lineList[0], p = v.pointList, f(p) || p.reverse(), m.getLineNum() === 1) {
				for (C = 0; C < p.length; C++) y = p[C], x = new i(), x.id = -1, x.point = y, x.value = r[v.ijPointList[C].i][v.ijPointList[C].j], T.push(x);
				for (C = 0; C < e.length; C++) E = e[C], E.borderIdx === S && (w.push(E), E.type === "Border" && (y = E.pointList[0], x = new i(), x.id = w.length - 1, x.point = y, x.value = E.value, l.push(x), y = E.pointList[E.pointList.length - 1], x = new i(), x.id = w.length - 1, x.point = y, x.value = E.value, l.push(x)));
				if (w.length === 0) {
					if (O = v.ijPointList[0], D = new _(), r[O.i][O.j] < n[0]) k = n[0], D.isHighCenter = !1;
					else {
						for (C = n.length - 1; C >= 0; C--) if (r[O.i][O.j] > n[C]) {
							k = n[C];
							break;
						}
						D.isHighCenter = !0;
					}
					p.length > 0 && (D.isBorder = !0, D.highValue = k, D.lowValue = k, D.extent = new t(), D.area = d(p, D.extent), D.startPointIdx = 0, D.isClockWise = !0, D.outLine.type = "Border", D.outLine.value = k, D.outLine.borderIdx = S, D.outLine.pointList = p, D.holeLines = [], o.push(D));
				} else c = l.length > 0 ? u.insertPoint2Border(l, T) : T, o = u.tracingPolygons_Line_Border(w, c);
				o = u.addPolygonHoles(o);
			} else {
				for (v = m.lineList[0], C = 0; C < e.length; C++) E = e[C], E.borderIdx === S && (w.push(E), E.type === "Border" && (y = E.pointList[0], x = new i(), x.id = w.length - 1, x.point = y, x.value = E.value, l.push(x), y = E.pointList[E.pointList.length - 1], x = new i(), x.id = w.length - 1, x.point = y, x.value = E.value, l.push(x)));
				if (w.length === 0) {
					if (O = v.ijPointList[0], D = new _(), r[O.i][O.j] < n[0]) k = n[0], D.isHighCenter = !1;
					else {
						for (C = n.length - 1; C >= 0; C--) if (r[O.i][O.j] > n[C]) {
							k = n[C];
							break;
						}
						D.isHighCenter = !0;
					}
					p.length > 0 && (D.isBorder = !0, D.highValue = k, D.lowValue = k, D.area = d(p, D.extent), D.startPointIdx = 0, D.isClockWise = !0, D.outLine.type = "Border", D.outLine.value = k, D.outLine.borderIdx = S, D.outLine.pointList = p, D.holeLines = [], o.push(D));
				} else {
					A = [], A.length = m.getLineNum(), c = u.insertPoint2Border_Ring(r, l, m, A), o = b(w, c, m, n, A);
					let e = [];
					for (; o.length > 0;) {
						let t = !1;
						for (C = 0; C < e.length; C++) if (o[0].area > e[C].area) {
							e.push(o[0]), t = !0;
							break;
						}
						t || e.push(o[0]), o.splice(0, 1);
					}
					o = e;
				}
				let t = [];
				for (C = 0; C < m.getLineNum(); C++) t.push(m.lineList[C].pointList);
				t.length > 0 && h(o, t), o = g(o);
			}
			s.push(...o);
		}
		for (let e of s) f(e.outLine.pointList) || e.outLine.pointList.reverse();
		return s;
	}
	static isoline_UndefData(e, t, n, i, o, c, l, d, f) {
		let p = [], m, h, g, _;
		m = e.length, h = e[0].length;
		let v, b, x, S, C = 0, w = 0, T, E, D = 0, O = 0, k, A, j, M, N, P = !0, F = new a();
		for (g = 0; g < m; g++) for (_ = 0; _ < h; _++) {
			if (_ < h - 1 && l[0][g][_] > -1 && o[g][_] !== -2) {
				for (N = [], b = g, S = _, T = t[S] + o[b][S] * (t[S + 1] - t[S]), E = n[b], l[1][g][_] === 0 ? (v = -1, F.sPoint.x = t[_ + 1], F.sPoint.y = n[g]) : (v = b, F.sPoint.x = t[_], F.sPoint.y = n[g]), x = S, j = new r(), j.x = T, j.y = E, N.push(j), F.index = f + p.length, F.point = j, F.borderIdx = l[0][g][_], u._endPointList.push(F), M = new s(), M.type = "Border", M.borderIdx = l[0][g][_];;) {
					let e = [C, w], i = [D, O], a = [P];
					if (y(v, b, c, o, x, S, t, n, T, e, i, a)) {
						if (C = e[0], w = e[1], D = i[0], O = i[1], P = a[0], j = new r(), j.x = D, j.y = O, N.push(j), P) {
							if (l[0][C][w] > -1) {
								l[1][C][w] === 0 ? (F.sPoint.x = t[w + 1], F.sPoint.y = n[C]) : (F.sPoint.x = t[w], F.sPoint.y = n[C]);
								break;
							}
						} else if (d[0][C][w] > -1) {
							d[1][C][w] === 0 ? (F.sPoint.x = t[w], F.sPoint.y = n[C]) : (F.sPoint.x = t[w], F.sPoint.y = n[C + 1]);
							break;
						}
						T = D, v = b, x = S, b = C, S = w;
					} else {
						M.type = "Error";
						break;
					}
				}
				o[g][_] = -2, N.length > 1 && M.type !== "Error" ? (F.point = j, u._endPointList.push(F), M.value = i, M.pointList = N, p.push(M)) : u._endPointList.pop();
			}
			if (g < m - 1 && d[0][g][_] > -1 && c[g][_] !== -2) {
				for (N = [], b = g, S = _, T = t[S], E = n[b] + c[b][S] * (n[b + 1] - n[b]), v = b, d[1][g][_] === 0 ? (x = -1, F.sPoint.x = t[_], F.sPoint.y = n[g]) : (x = S, F.sPoint.x = t[_], F.sPoint.y = n[g + 1]), j = new r(), j.x = T, j.y = E, N.push(j), F.index = f + p.length, F.point = j, F.borderIdx = d[0][g][_], u._endPointList.push(F), M = new s(), M.type = "Border", M.borderIdx = d[0][g][_];;) {
					let e = [C, w], i = [D, O], a = [P];
					if (y(v, b, c, o, x, S, t, n, T, e, i, a)) {
						if (C = e[0], w = e[1], D = i[0], O = i[1], P = a[0], j = new r(), j.x = D, j.y = O, N.push(j), P) {
							if (l[0][C][w] > -1) {
								l[1][C][w] === 0 ? (F.sPoint.x = t[w + 1], F.sPoint.y = n[C]) : (F.sPoint.x = t[w], F.sPoint.y = n[C]);
								break;
							}
						} else if (d[0][C][w] > -1) {
							d[1][C][w] === 0 ? (F.sPoint.x = t[w], F.sPoint.y = n[C]) : (F.sPoint.x = t[w], F.sPoint.y = n[C + 1]);
							break;
						}
						T = D, v = b, x = S, b = C, S = w;
					} else {
						M.type = "Error";
						break;
					}
				}
				c[g][_] = -2, N.length > 1 && M.type !== "Error" ? (F.point = j, u._endPointList.push(F), M.value = i, M.pointList = N, p.push(M)) : u._endPointList.pop();
			}
		}
		for (_ = 0; _ < h - 1; _++) o[0][_] !== -2 && (o[0][_] = -2), o[m - 1][_] !== -2 && (o[m - 1][_] = -2);
		for (g = 0; g < m - 1; g++) c[g][0] !== -2 && (c[g][0] = -2), c[g][h - 1] !== -2 && (c[g][h - 1] = -2);
		for (g = 1; g < m - 2; g++) for (_ = 1; _ < h - 1; _++) if (c[g][_] !== -2) {
			let e = [];
			for (b = g, S = _, T = t[S], E = n[g] + c[g][S] * (n[g + 1] - n[g]), x = -1, v = b, k = T, A = E, j = new r(), j.x = T, j.y = E, e.push(j), M = new s(), M.type = "Close";;) {
				let i = [], a = [];
				if (y(v, b, c, o, x, S, t, n, T, i, a, [])) {
					if (C = i[0], w = i[1], D = a[0], O = a[1], j = new r(), j.x = D, j.y = O, e.push(j), Math.abs(O - A) < 1e-6 && Math.abs(D - k) < 1e-6) break;
					T = D, v = b, x = S, b = C, S = w;
				} else {
					M.type = "Error";
					break;
				}
			}
			c[g][_] = -2, e.length > 1 && M.type !== "Error" && (M.value = i, M.pointList = e, p.push(M));
		}
		for (g = 1; g < m - 1; g++) for (_ = 1; _ < h - 2; _++) if (o[g][_] !== -2) {
			let e = [];
			for (b = g, S = _, T = t[S] + o[g][_] * (t[S + 1] - t[S]), E = n[g], x = S, v = -1, k = T, A = E, j = new r(), j.x = T, j.y = E, e.push(j), M = new s(), M.type = "Close";;) {
				let i = [], a = [];
				if (y(v, b, c, o, x, S, t, n, T, i, a, [])) {
					if (C = i[0], w = i[1], D = a[0], O = a[1], j = new r(), j.x = D, j.y = O, e.push(j), Math.abs(O - A) < 1e-6 && Math.abs(D - k) < 1e-6) break;
					T = D, v = b, x = S, b = C, S = w;
				} else {
					M.type = "Error";
					break;
				}
			}
			o[g][_] = -2, e.length > 1 && M.type !== "Error" && (M.value = i, M.pointList = e, p.push(M));
		}
		return p;
	}
	static tracingPolygons_Line_Border(e, n) {
		if (e.length === 0) return [];
		let r = [], i = [], a, o, s, c, l, u;
		i.push(...e);
		let p, h, g, v = [];
		for (v.length = n.length - 1, l = 0; l < v.length; l++) v[l] = 0;
		let y, b, x, S, C = 0, w = 0, T = 0, E = [];
		for (b = n.length - 1, l = 0; l < b; l++) if (n[l].id !== -1) {
			if (y = l, p = [], E.push(n[l]), v[y] < 2) for (p.push(n[y].point), y += 1, y === b && (y = 0), x = 0, S = 0;;) {
				if (g = n[y], g.id === -1) {
					if (v[y] === 1) break;
					T = g.value, S += 1, p.push(g.point), v[y] += 1;
				} else {
					if (v[y] === 2) break;
					for (v[y] += 1, a = i[g.id], x === 0 ? (C = a.value, w = a.value, x += 1) : (a.value > C ? w = a.value : a.value < C && (C = a.value), x += 1), h = [], h.push(...a.pointList), o = h[0], g.point.x === o.x && g.point.y === o.y || h.reverse(), p.push(...h), u = 0; u < n.length - 1; u++) if (u !== y && n[u].id === g.id) {
						y = u, v[y] += 1;
						break;
					}
				}
				if (y === l) {
					p.length > 0 && (s = new _(), s.isBorder = !0, s.lowValue = C, s.highValue = w, c = new t(), s.area = d(p, c), s.isClockWise = !0, s.startPointIdx = E.length - 1, s.extent = c, s.outLine.pointList = p, s.outLine.value = C, s.isHighCenter = !0, s.holeLines = [], S > 0 && T < C && (s.isHighCenter = !1, s.highValue = C), s.outLine.type = "Border", r.push(s));
					break;
				}
				y += 1, y === b && (y = 0);
			}
			if (y = l, v[y] < 2) for (p = [], p.push(n[y].point), y += -1, y === -1 && (y = b - 1), x = 0, S = 0;;) {
				if (g = n[y], g.id === -1) {
					if (v[y] === 1) break;
					T = g.value, S += 1, p.push(g.point), v[y] += 1;
				} else {
					if (v[y] === 2) break;
					for (v[y] += 1, a = i[g.id], x === 0 ? (C = a.value, w = a.value, x += 1) : (a.value > C ? w = a.value : a.value < C && (C = a.value), x += 1), h = [], h.push(...a.pointList), o = h[0], g.point.x === o.x && g.point.y === o.y || h.reverse(), p.push(...h), u = 0; u < n.length - 1; u++) if (u !== y && n[u].id === g.id) {
						y = u, v[y] += 1;
						break;
					}
				}
				if (y === l) {
					p.length > 0 && (s = new _(), s.isBorder = !0, s.lowValue = C, s.highValue = w, c = new t(), s.area = d(p, c), s.isClockWise = !1, s.startPointIdx = E.length - 1, s.extent = c, s.outLine.pointList = p, s.outLine.value = C, s.isHighCenter = !0, s.holeLines = [], S > 0 && T < C && (s.isHighCenter = !1, s.highValue = C), s.outLine.type = "Border", r.push(s));
					break;
				}
				y += -1, y === -1 && (y = b - 1);
			}
		}
		let D = [], O;
		for (l = 0; l < i.length; l++) if (a = i[l], a.type === "Close" && a.pointList.length > 0) {
			for (s = new _(), s.isBorder = !1, s.lowValue = a.value, s.highValue = a.value, c = new t(), s.area = d(a.pointList, c), s.isClockWise = f(a.pointList), s.extent = c, s.outLine = a, s.isHighCenter = !0, s.holeLines = [], O = !1, u = 0; u < D.length; u++) if (s.area > D[u].area) {
				D.splice(u, 0, s), O = !0;
				break;
			}
			O || D.push(s);
		}
		return r = m(r, D, i, n), r;
	}
	static addPolygonHoles(e) {
		let t = [], n, r;
		for (n = 0; n < e.length; n++) {
			let r = e[n];
			r.isBorder || (r.holeIndex = 1, t.push(r));
		}
		if (t.length === 0) return e;
		{
			let i = [];
			for (n = 1; n < t.length; n++) {
				let e = t[n];
				for (r = n - 1; r >= 0; r--) {
					let n = t[r];
					if (n.extent.include(e.extent) && p(n.outLine.pointList, e.outLine.pointList[0])) {
						e.holeIndex = n.holeIndex + 1, n.addHole(e);
						break;
					}
				}
			}
			let a = [];
			for (n = 0; n < t.length; n++) t[n].holeIndex === 1 && a.push(t[n]);
			for (n = 0; n < e.length; n++) {
				let t = e[n];
				if (t.isBorder === !0) {
					for (r = 0; r < a.length; r++) {
						let e = a[r];
						t.extent.include(e.extent) && p(t.outLine.pointList, e.outLine.pointList[0]) && t.addHole(e);
					}
					i.push(t);
				}
			}
			return i.push(...t), i;
		}
	}
	tracingStreamline(e, t, n, a, o, c) {
		let u = [], d = e[1].length, f = e.length, p = [], m = [], h = n[1] - n[0], g = a[1] - a[0];
		c === 0 && (c = 1);
		let _ = h / c ** 2, v = _ * 1.5, y, b;
		for (y = 0; y < f; y++) for (p[y] = [], m[y] = [], b = 0; b < d; b++) if (Math.abs(e[y][b] / o - 1) < .01) p[y][b] = .1, m[y][b] = .1;
		else {
			let n = Math.sqrt(e[y][b] * e[y][b] + t[y][b] * t[y][b]);
			n === 0 && (n = 1), p[y][b] = e[y][b] / n * h / c, m[y][b] = t[y][b] / n * g / c;
		}
		let S = [], C = [];
		for (y = 0; y < f - 1; y++) for (S[y] = [], C[y] = [], b = 0; b < d - 1; b++) y % 2 == 0 && b % 2 == 0 ? C[y][b] = 0 : C[y][b] = 1, S[y][b] = [];
		let w, T, E = 0;
		for (y = 0; y < f - 1; y++) for (b = 0; b < d - 1; b++) if (C[y][b] === 0) {
			let t = [], c = new r(), d, f, D, O = new s();
			for (c.x = n[b] + h / 2, c.y = a[y] + g / 2, t.push(c.clone()), T = new i(), T.point = c.clone(), T.id = E, S[y][b].push(T), C[y][b] = 1, d = y, f = b, D = 0; D < 500;) {
				let r = [];
				r[0] = d, r[1] = f;
				let s = x(c, p, m, n, a, r, !0);
				if (d = r[0], f = r[1], s) {
					if (Math.abs(e[d][f] / o - 1) < .01 || Math.abs(e[d][f + 1] / o - 1) < .01 || Math.abs(e[d + 1][f] / o - 1) < .01 || Math.abs(e[d + 1][f + 1] / o - 1) < .01) break;
					{
						let e = !1;
						for (let t of S[d][f]) if (Math.sqrt((c.x - t.point.x) * (c.x - t.point.x) + (c.y - t.point.y) * (c.y - t.point.y)) < _) {
							e = !0;
							break;
						}
						if (!e && S[d][f].length > 1) {
							let t = S[d][f][0], n = S[d][f][1];
							E === t.id && E === n.id || (w = l(t.point, n.point, c), w < v && (e = !0));
						}
						if (!e) t.push(c.clone()), T = new i(), T.point = c.clone(), T.id = E, S[d][f].push(T), C[d][f] = 1;
						else break;
					}
				} else break;
				D += 1;
			}
			for (c.x = n[b] + h / 2, c.y = a[y] + g / 2, d = y, f = b, D = 0; D < 500;) {
				let r = [];
				r[0] = d, r[1] = f;
				let s = x(c, p, m, n, a, r, !1);
				if (d = r[0], f = r[1], s) {
					if (Math.abs(e[d][f] / o - 1) < .01 || Math.abs(e[d][f + 1] / o - 1) < .01 || Math.abs(e[d + 1][f] / o - 1) < .01 || Math.abs(e[d + 1][f + 1] / o - 1) < .01) break;
					{
						let e = !1;
						for (let t of S[d][f]) if (Math.sqrt((c.x - t.point.x) * (c.x - t.point.x) + (c.y - t.point.y) * (c.y - t.point.y)) < _) {
							e = !0;
							break;
						}
						if (!e && S[d][f].length > 1) {
							let t = S[d][f][0], n = S[d][f][1];
							E === t.id && E === n.id || (w = l(t.point, n.point, c), w < v && (e = !0));
						}
						if (!e) t.splice(0, 0, c.clone()), T = new i(), T.point = c.clone(), T.id = E, S[d][f].push(T), C[d][f] = 1;
						else break;
					}
				} else break;
				D += 1;
			}
			t.length > 1 && (O.pointList = t, u.push(O), E += 1);
		}
		return u;
	}
	static insertPoint2Border(e, t) {
		let n, r, i, a, o, s, c, l = [];
		for (l.push(...t), i = 0; i < e.length; i++) for (r = e[i], c = r.point, n = l[0], o = n.point, a = 1; a < l.length; a++) {
			if (n = l[a], s = n.point, (c.x - o.x) * (c.x - s.x) <= 0 && (c.y - o.y) * (c.y - s.y) <= 0 && (c.x - o.x) * (s.y - o.y) - (s.x - o.x) * (c.y - o.y) === 0) {
				l.splice(a, 0, r);
				break;
			}
			o = s;
		}
		return l;
	}
	static insertPoint2Border_Ring(e, t, n, r) {
		let a, o, s, c, l, u, d, f, p, m = [], h = [], g = [];
		for (l = 0; l < n.getLineNum(); l++) {
			for (p = n.lineList[l], h = [], s = 0; s < p.pointList.length; s++) a = new i(), a.id = -1, a.borderIdx = l, a.point = p.pointList[s], a.value = e[p.ijPointList[s].i][p.ijPointList[s].j], h.push(a);
			for (s = 0; s < t.length; s++) for (o = t[s].clone(), o.borderIdx = l, f = o.point, u = h[0].point.clone(), c = 1; c < h.length; c++) {
				if (d = h[c].point.clone(), (f.x - u.x) * (f.x - d.x) <= 0 && (f.y - u.y) * (f.y - d.y) <= 0 && (f.x - u.x) * (d.y - u.y) - (d.x - u.x) * (f.y - u.y) === 0) {
					h.splice(c, 0, o);
					break;
				}
				u = d;
			}
			for (g = [], s = 0; s < h.length; s++) o = h[s], o.bInnerIdx = s, g.push(o);
			r[l] = g.length, m.push(...g);
		}
		return m;
	}
};
//#endregion
//#region src/contour/utils/spline.ts
function C(e, t, n) {
	let r = O(t), i = 0, a = 0;
	for (let t = 0; t < 4; t++) {
		let o = e[n + t];
		i += r[t] * o.x, a += r[t] * o.y;
	}
	return [i, a];
}
function w(e) {
	return 1 / 6 * (-e + 1) * (-e + 1) * (-e + 1);
}
function T(e) {
	return 1 / 6 * (3 * e * e * e - 6 * e * e + 4);
}
function E(e) {
	return 1 / 6 * (-3 * e * e * e + 3 * e * e + 3 * e + 1);
}
function D(e) {
	return 1 / 6 * e * e * e;
}
function O(e) {
	return [
		w(e),
		T(e),
		E(e),
		D(e)
	];
}
function k(e, t) {
	let n, i, a, o, s, c = [];
	if (t < 4) return null;
	let l = !1;
	s = e[0];
	let u = e[t - 1];
	for (s.x === u.x && s.y === u.y && (e.splice(0, 1), e.push(e[0]), e.push(e[1]), e.push(e[2]), e.push(e[3]), e.push(e[4]), e.push(e[5]), e.push(e[6]), l = !0), t = e.length, i = 0; i < t - 3; i++) for (n = 0; n <= 1; n += .05) {
		let t = C(e, n, i);
		a = t[0], o = t[1], l ? i > 3 && (s = new r(), s.x = a, s.y = o, c.push(s)) : (s = new r(), s.x = a, s.y = o, c.push(s));
	}
	return l ? c.push(c[0]) : (c.splice(0, 0, e[0]), c.push(e[e.length - 1])), c;
}
//#endregion
//#region src/contour/utils/contour.ts
function A(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let i = e[n], a = i.pointList;
		if (!(a.length <= 1)) {
			if (a.length === 2) {
				let e = new r(), t = a[0], n = a[1];
				e.x = (n.x - t.x) / 4 + t.x, e.y = (n.y - t.y) / 4 + t.y, a.splice(1, 0, e), e = new r(), e.x = (n.x - t.x) / 4 * 3 + t.x, e.y = (n.y - t.y) / 4 * 3 + t.y, a.splice(2, 0, e);
			}
			if (a.length === 3) {
				let e = new r(), t = a[0], n = a[1];
				e.x = (n.x - t.x) / 2 + t.x, e.y = (n.y - t.y) / 2 + t.y, a.splice(1, 0, e);
			}
			i.pointList = k(a, a.length), t.push(i);
		}
	}
	return t;
}
//#endregion
//#region src/contour/utils/convert.ts
function j(e) {
	return {
		type: "Feature",
		geometry: {
			type: "LineString",
			coordinates: e.pointList.map((e) => [e.x, e.y])
		},
		properties: { value: e.value }
	};
}
function M(e) {
	let t = [];
	for (let n of e) {
		let e = j(n);
		t.push(e);
	}
	return {
		type: "FeatureCollection",
		features: t
	};
}
function N(e, t) {
	let { outLine: n, holeLines: r } = e, i = [n.pointList.map((e) => [e.x, e.y])], a = n.value;
	if (e.isHighCenter) {
		let n = t.indexOf(e.lowValue);
		a = n >= 0 && n < t.length - 1 ? t[n + 1] : e.lowValue;
	}
	if (e.hasHoles()) for (let e = 0; e < r.length; e++) {
		let t = r[e], n = [];
		for (let e = 0, r = t.pointList; e < r.length; e++) {
			let t = r[e];
			n.push([t.x, t.y]);
		}
		i.push(n);
	}
	return {
		type: "Feature",
		geometry: {
			type: "Polygon",
			coordinates: i
		},
		properties: { value: a }
	};
}
function P(e, t) {
	let n = [];
	for (let r of e) {
		let e = N(r, t);
		n.push(e);
	}
	return {
		type: "FeatureCollection",
		features: n
	};
}
//#endregion
export { S as Contour, P as isobands, M as isolines, A as smoothLines };
