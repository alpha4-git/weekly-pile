/* Exercise figures: simple kinematic stick figures (world units ~cm, y up).
   Each exercise returns two scenes (panels) of primitives + numbered markers. */
const FIG = (() => {
  const D = Math.PI / 180;
  const dir = a => [Math.cos(a * D), Math.sin(a * D)];
  const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s];
  const P = (p, ang, len) => add(p, dir(ang), len);
  const L = { low: 24, up: 28, upper: 32, fore: 27, thigh: 44, shank: 43, headR: 10.5, neck: 15 };

  // two-link inverse kinematics; bend = +1 puts the middle joint counter-clockwise of root->target
  function ik(a, t, l1, l2, bend) {
    const dx = t[0] - a[0], dy = t[1] - a[1];
    let d = Math.hypot(dx, dy);
    const base = Math.atan2(dy, dx);
    if (d >= l1 + l2 - 0.01) { const m = [a[0] + l1 * Math.cos(base), a[1] + l1 * Math.sin(base)]; return [m, [m[0] + l2 * Math.cos(base), m[1] + l2 * Math.sin(base)]]; }
    d = Math.max(d, Math.abs(l1 - l2) + 0.01);
    const A = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const ang = base + bend * A;
    const m = [a[0] + l1 * Math.cos(ang), a[1] + l1 * Math.sin(ang)];
    const ang2 = Math.atan2(t[1] - m[1], t[0] - m[0]);
    return [m, [m[0] + l2 * Math.cos(ang2), m[1] + l2 * Math.sin(ang2)]];
  }

  // ---------- primitive builders ----------
  const ln = (a, b, w, c) => ({ t: 'l', a, b, w, c });
  const pl = (pts, c, w = 2) => ({ t: 'p', pts, c, w });            // filled polygon
  const ci = (p, r, c) => ({ t: 'c', p, r, c });
  const poly = (pts, w, c) => ({ t: 'pl', pts, w, c });              // open polyline

  // a rectangle given a centre line a->b and thickness
  function bar(a, b, th, c) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const n = [-Math.sin(ang) * th / 2, Math.cos(ang) * th / 2];
    return pl([add(a, n), add(b, n), add(b, n, -1), add(a, n, -1)], c);
  }
  // pad: rectangle lying on a surface line a->b, thickness th on the "below" side (clockwise normal)
  function pad(a, b, th, c = 'pad') {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const n = [Math.sin(ang) * th, -Math.cos(ang) * th];
    return pl([a, b, add(b, n), add(a, n)], c);
  }
  const floor = (x0, x1) => ln([x0, 0], [x1, 0], 2.5, 'floor');

  // dumbbell seen end-on (handle points at viewer)
  const dbEnd = (p, r = 8) => [ci(p, r, 'load'), ci(p, r * 0.38, 'loadhub')];
  // dumbbell seen from the side, handle along angle
  function dbSide(p, ang, len = 26) {
    const u = dir(ang), h = len / 2;
    const a = add(p, u, -h), b = add(p, u, h);
    return [ln(add(p, u, -h + 4), add(p, u, h - 4), 3, 'loadhub'), bar(add(a, u, 0), add(a, u, 7), 15, 'load'), bar(add(b, u, -7), add(b, u, 0), 15, 'load')];
  }

  // ---------- side-view body ----------
  // spec: H hip, tLow, tUp torso angles, head (angle offset), arms:[{hand, bend, l1?, l2?}], legs:[{ankle, bend, foot:{ang, flat?}}]
  function side(sp) {
    const H = sp.H;
    const M = P(H, sp.tLow, L.low);
    const S = P(M, sp.tUp ?? sp.tLow, L.up);
    const headAng = (sp.tUp ?? sp.tLow) + (sp.head || 0);
    const Hc = P(S, headAng, L.neck);
    const out = { H, M, S, Hc, arms: [], legs: [] };
    for (const a of sp.arms || []) {
      const [e, h] = a.elbow ? [a.elbow, a.hand] : ik(S, a.hand, a.l1 || L.upper, a.l2 || L.fore, a.bend);
      out.arms.push({ e, h, far: !!a.far });
    }
    for (const g of sp.legs || []) {
      const [k, an] = ik(H, g.ankle, g.l1 || L.thigh, g.l2 || L.shank, g.bend);
      // foot: heel and toe from the ankle
      const fa = g.footAng ?? 0;                                   // direction ankle->toe
      let heel, toe;
      if (g.flat) { heel = [an[0] - 5, 2]; toe = [an[0] + 18, 2]; }
      else { toe = P(an, fa, 18); heel = P(an, fa + 180, 5); }
      out.legs.push({ k, an, heel, toe, far: !!g.far });
    }
    return out;
  }
  function drawSide(b, prims, extra = {}) {
    const limbArm = (a, cls) => { if (cls === 'body') { prims.push(ln(b.S, a.e, 11, 'halo')); prims.push(ln(a.e, a.h, 10, 'halo')); } prims.push(ln(b.S, a.e, 8, cls)); prims.push(ln(a.e, a.h, 7, cls)); prims.push(ci(a.h, 3.6, cls)); };
    const limbLeg = (g, cls) => { if (cls === 'body') { prims.push(ln(g.k, g.an, 11, 'halo')); } prims.push(ln(b.H, g.k, 10.5, cls)); prims.push(ln(g.k, g.an, 8.5, cls)); prims.push(ln(g.heel, g.toe, 6, cls)); };
    b.legs.filter(g => g.far).forEach(g => limbLeg(g, 'far'));
    b.arms.filter(a => a.far).forEach(a => limbArm(a, 'far'));
    (extra.behind || []).forEach(p => prims.push(p));
    prims.push(poly([b.H, b.M, b.S], 13, 'body'));
    prims.push(ln(b.S, P(b.S, Math.atan2(b.Hc[1] - b.S[1], b.Hc[0] - b.S[0]) / D, 6), 7, 'body'));
    prims.push(ci(b.Hc, L.headR, 'head'));
    b.legs.filter(g => !g.far).forEach(g => limbLeg(g, 'body'));
    (extra.mid || []).forEach(p => prims.push(p));
    b.arms.filter(a => !a.far).forEach(a => limbArm(a, 'body'));
  }

  // ---------- front-view body ----------
  // spec: cx, hipY, shY, arms:{up, fore} (right arm angles; mirrored), legs: {knee:[dx,y], ankle:[dx,y]} for right leg
  function front(sp) {
    const cx = sp.cx || 0, hy = sp.hipY, sy = sp.shY;
    const R = { sh: [cx + 19, sy], hip: [cx + 9, hy] };
    const o = { cx, hy, sy, head: [cx, sy + 22], sides: [] };
    for (const s of [1, -1]) {
      const sh = [cx + 19 * s, sy], hp = [cx + 9 * s, hy];
      const mir = a => s === 1 ? a : 180 - a;
      const e = P(sh, mir(sp.arm.up), sp.arm.l1 || L.upper);
      const h = P(e, mir(sp.arm.fore), sp.arm.l2 || L.fore);
      const k = [cx + sp.leg.knee[0] * s, sp.leg.knee[1]];
      const an = [cx + sp.leg.ankle[0] * s, sp.leg.ankle[1]];
      o.sides.push({ s, sh, hp, e, h, k, an });
    }
    return o;
  }
  function drawFront(f, prims, extra = {}) {
    const [r, l] = f.sides;
    (extra.behind || []).forEach(p => prims.push(p));
    // legs
    for (const sd of f.sides) {
      prims.push(ln(sd.hp, sd.k, 11, 'body'));
      prims.push(ln(sd.k, sd.an, 9, 'body'));
      if (!f.noFeet) prims.push(ln(sd.an, [sd.an[0] + 9 * sd.s, sd.an[1] - 4], 6, 'body'));
    }
    // torso
    prims.push(pl([[f.cx + 21, f.sy + 2], [f.cx - 21, f.sy + 2], [f.cx - 13, f.hy + 2], [f.cx + 13, f.hy + 2]], 'bodyfill'));
    prims.push(ln([f.cx, f.sy], [f.cx, f.sy + 10], 7, 'body'));
    prims.push(ci(f.head, L.headR, 'head'));
    (extra.mid || []).forEach(p => prims.push(p));
    for (const sd of f.sides) {
      prims.push(ln(sd.sh, sd.e, 8, 'body'));
      prims.push(ln(sd.e, sd.h, 7, 'body'));
      prims.push(ci(sd.h, 3.6, 'body'));
    }
  }

  // ---------- equipment helpers ----------
  function seatWithBack(x0, x1, y, backAng, backLen, legs = true) {
    const out = [pad([x0, y], [x1, y], 6), pad(P([x0, y], backAng, backLen), [x0, y], 6)];
    if (legs) { out.push(ln([(x0 + x1) / 2, y - 6], [(x0 + x1) / 2, 0], 4, 'frame')); out.push(ln([x0 - 6, 0], [x1 + 6, 0], 4, 'frame')); }
    return out;
  }

  // ---------- exercises ----------
  const EX = {};

  EX.incline_db_press = () => {
    const hinge = [0, 46];
    const bench = [
      pad([-4, 46], [34, 46], 6),
      pad(P(hinge, 150, 82), hinge, 6),
      ln([14, 40], [14, 0], 4, 'frame'), ln(P(hinge, 150, 55), [P(hinge, 150, 55)[0], 0], 4, 'frame'),
      ln([-46, 0], [40, 0], 4, 'frame'),
    ];
    const H = [8, 55];
    const leg = { ankle: [64, 7], bend: 1, flat: true };
    const top = side({ H, tLow: 150, head: 2, legs: [leg] });
    const mk = (hand, bend, l1) => side({ H, tLow: 150, head: 2, legs: [leg], arms: [{ hand, bend, l1 }] });
    const S = top.S;
    const A = mk([S[0] + 3, S[1] + 58.6], -1);
    const B = mk([S[0] + 11, S[1] + 7], -1, 23);
    const scene = (b) => { const p = [floor(-60, 90), ...bench]; drawSide(b, p, { mid: dbEnd(b.arms[0].h) }); return p; };
    return {
      view: 'side', labels: ['Top', 'Bottom'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: P(hinge, 150, 20), o: [-4, -22] }, { n: 2, p: A.S, o: [-4, -20] }, { n: 3, p: A.legs[0].toe, o: [8, 12] }],
        [{ n: 4, p: B.arms[0].h, o: [18, 10] }, { n: 5, p: B.arms[0].e, o: [18, -6] }],
      ],
    };
  };

  EX.chest_press = () => {
    const seat = seatWithBack(-16, 24, 46, 100, 72);
    const H = [-4, 55];
    const leg = { ankle: [44, 7], bend: 1, flat: true };
    const base = side({ H, tLow: 100, legs: [leg] });
    const S = base.S;
    const mk = (hand, l1) => side({ H, tLow: 100, legs: [leg], arms: [{ hand, bend: -1, l1 }] });
    const A = mk([S[0] + 8, S[1] - 13], 26);
    const B = mk([S[0] + 56, S[1] - 11]);
    const scene = b => { const h = b.arms[0].h; const p = [floor(-40, 80), ...seat]; drawSide(b, p, { mid: [bar([h[0], h[1] - 7], [h[0], h[1] + 7], 6, 'load')] }); return p; };
    return {
      view: 'side', labels: ['Start', 'Press'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: A.arms[0].h, o: [16, -6] }, { n: 2, p: A.S, o: [-16, 2] }],
        [{ n: 3, p: B.arms[0].e, o: [4, -16] }, { n: 4, p: B.M, o: [-16, -4] }],
      ],
    };
  };

  EX.shoulder_press = () => {
    const seat = seatWithBack(-16, 24, 46, 95, 78);
    const H = [-4, 55];
    const leg = { ankle: [44, 7], bend: 1, flat: true };
    const S = side({ H, tLow: 95, legs: [leg] }).S;
    const mk = (hand, l1, bend) => side({ H, tLow: 95, legs: [leg], arms: [{ hand, bend, l1 }] });
    const A = mk([S[0] + 12, S[1] + 5], 25, -1);
    const B = mk([S[0] + 4, S[1] + 55], undefined, -1);
    const scene = b => { const h = b.arms[0].h; const p = [floor(-40, 80), ...seat]; drawSide(b, p, { mid: [bar([h[0], h[1] - 7], [h[0], h[1] + 7], 6, 'load')] }); return p; };
    return {
      view: 'side', labels: ['Start', 'Press'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: A.arms[0].h, o: [16, 4] }, { n: 2, p: A.M, o: [-18, 0] }],
        [{ n: 3, p: B.arms[0].e, o: [16, -2] }],
      ],
    };
  };

  EX.lat_pulldown = () => {
    const H = [0, 55];
    const leg = { ankle: [46, 7], bend: 1, flat: true };
    const base = side({ H, tLow: 105, legs: [leg] });
    const S = base.S, K = base.legs[0].k;
    const pulley = [S[0] + 12, 222];
    const seat = [pad([-14, 46], [22, 46], 6), ln([4, 40], [4, 0], 4, 'frame'), ln([-20, 0], [30, 0], 4, 'frame')];
    const thighPad = ci([K[0] - 8, K[1] + 11], 6, 'pad');
    const mk = hand => side({ H, tLow: 105, legs: [leg], arms: [{ hand, bend: -1 }] });
    const A = mk([S[0] + 9, S[1] + 57]);
    const B = mk([S[0] + 15, S[1] - 2]);
    const scene = b => { const h = b.arms[0].h; const p = [floor(-40, 80), ...seat, ln(h, pulley, 1.6, 'cable'), ci(pulley, 6, 'frame'), thighPad]; drawSide(b, p, { mid: [ci(h, 4.5, 'load')] }); return p; };
    return {
      view: 'side', labels: ['Start', 'Pull'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: [K[0] - 8, K[1] + 11], o: [16, 8] }, { n: 2, p: A.M, o: [-18, 0] }],
        [{ n: 3, p: B.arms[0].h, o: [18, 6] }, { n: 4, p: B.arms[0].e, o: [-6, -16] }],
      ],
    };
  };

  EX.cable_row = () => {
    const H = [0, 49];
    const ank = [76, 32];
    const leg = { ankle: ank, bend: 1, footAng: 90 };
    const plateX = ank[0] + 6;
    const pulley = [plateX + 6, 40];
    const eq = [pad([-24, 40], [20, 40], 6), ln([-2, 34], [-2, 0], 4, 'frame'), ln([-30, 0], [plateX + 14, 0], 4, 'frame'),
      bar([plateX, 14], [plateX, 50], 5, 'frame'), ci(pulley, 5, 'frame')];
    const mk = hand => side({ H, tLow: 90, legs: [leg], arms: [{ hand, bend: -1 }] });
    const A = mk([52, 72]);
    const B = mk([15, 76]);
    const scene = b => { const h = b.arms[0].h; const p = [floor(-40, 110), ...eq, ln(h, pulley, 1.6, 'cable')]; drawSide(b, p, { mid: [ci(h, 4.5, 'load')] }); return p; };
    return {
      view: 'side', labels: ['Reach', 'Pull'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: A.legs[0].k, o: [2, 16] }, { n: 4, p: A.M, o: [-18, 0] }],
        [{ n: 2, p: B.S, o: [-18, 6] }, { n: 3, p: B.arms[0].e, o: [-4, -18] }],
      ],
    };
  };

  EX.machine_curl = () => {
    const H = [-10, 55];
    const leg = { ankle: [34, 7], bend: 1, flat: true };
    const S = side({ H, tLow: 85, legs: [leg] }).S;
    const E = P(S, -45, L.upper);
    // pad surface just under the upper arm
    const n = dir(-135);
    const p0 = add(P(S, -45, 6), n, 6), p1 = add(P(S, -45, 40), n, 6);
    const eq = [pad([-26, 46], [12, 46], 6), ln([-7, 40], [-7, 0], 4, 'frame'), ln([-30, 0], [44, 0], 4, 'frame'),
      pad(p0, p1, 8), ci(E, 4, 'pivot')];
    const mk = fore => side({ H, tLow: 85, legs: [leg], arms: [{ elbow: E, hand: P(E, fore, L.fore) }] });
    const A = mk(-32);
    const B = mk(95);
    const scene = b => { const h = b.arms[0].h; const p = [floor(-40, 80), ...eq]; drawSide(b, p, { mid: [ci(h, 4.5, 'load')] }); return p; };
    return {
      view: 'side', labels: ['Bottom', 'Top'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: E, o: [14, 12] }, { n: 2, p: A.arms[0].h, o: [14, 6] }],
        [{ n: 3, p: B.S, o: [-18, 4] }],
      ],
    };
  };

  EX.oh_triceps = () => {
    const H = [-3, 90];
    const legs = [{ ankle: [20, 7], bend: 1, flat: true }, { ankle: [-26, 7], bend: 1, flat: true, far: true }];
    const base = side({ H, tLow: 70, head: 5, legs });
    const S = base.S;
    const E = P(S, 86, L.upper);
    const pulley = [-62, 8];
    const mk = fore => side({ H, tLow: 70, head: 5, legs, arms: [{ elbow: E, hand: P(E, fore, L.fore) }] });
    const A = mk(248);
    const B = mk(84);
    const scene = b => { const h = b.arms[0].h; const p = [floor(-75, 60), ci(pulley, 5, 'frame'), bar([-70, 0], [-70, 60], 6, 'frame'), ln(h, pulley, 1.6, 'cable')]; drawSide(b, p, { mid: [ci(h, 4.5, 'load')] }); return p; };
    return {
      view: 'side', labels: ['Stretch', 'Extend'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: pulley, o: [14, 12] }, { n: 2, p: E, o: [16, 4] }, { n: 3, p: base.M, o: [16, -6] }],
        [{ n: 4, p: B.arms[0].h, o: [16, 0] }],
      ],
    };
  };

  EX.lateral_raise = () => {
    const leg = { knee: [10, 50], ankle: [11, 7] };
    const A = front({ hipY: 92, shY: 140, arm: { up: 263, fore: 268 }, leg });
    const B = front({ hipY: 92, shY: 140, arm: { up: 3, fore: -4 }, leg });
    const scene = f => { const p = [floor(-80, 80)]; drawFront(f, p); f.sides.forEach(sd => p.push(...dbEnd(sd.h, 7))); return p; };
    return {
      view: 'front', labels: ['Start', 'Top'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 4, p: [0, 120], o: [26, -2] }],
        [{ n: 1, p: B.sides[0].e, o: [0, 16] }, { n: 2, p: B.sides[0].h, o: [6, -16] }, { n: 3, p: [12, 146], o: [6, 18] }],
      ],
    };
  };

  EX.reverse_fly = () => {
    // top view: +y is forward (toward the pad), shoulders on y = 0
    const padR = pl([[-18, 14], [18, 14], [18, 22], [-18, 22]], 'pad');
    const torso = pl([[-22, 6], [22, 6], [24, -6], [-24, -6]], 'bodyfill');
    const mk = (hand, bend) => {
      const prims = [padR, torso, ci([0, 1], L.headR, 'head'), ln([0, 9], [0, 13], 3, 'body')];
      const pts = {};
      for (const s of [1, -1]) {
        const sh = [20 * s, 0];
        const [e, h] = ik(sh, [hand[0] * s, hand[1]], L.upper, L.fore, bend * s);
        prims.push(ln(sh, e, 8, 'body'), ln(e, h, 7, 'body'), ci(h, 4.5, 'load'));
        if (s === 1) Object.assign(pts, { e, h });
      }
      return { prims, pts };
    };
    const A = mk([8, 57.3], -1);
    const B = mk([78.4, -4], -1);
    return {
      view: 'top', labels: ['Start (from above)', 'Finish'],
      panels: [A.prims, B.prims],
      marks: [
        [{ n: 1, p: [-14, 18], o: [-14, 12] }, { n: 4, p: A.pts.h, o: [16, 4] }],
        [{ n: 2, p: B.pts.e, o: [0, 16] }, { n: 3, p: B.pts.h, o: [0, -16] }],
      ],
    };
  };

  EX.leg_press = () => {
    const H = [-10, 48];
    const back = [pad([-24, 40], [18, 40], 6), pad(P([-18, 40], 120, 74), [-18, 40], 6), ln([-4, 34], [-4, 0], 4, 'frame'), ln([-60, 0], [110, 0], 4, 'frame')];
    const mk = ankle => side({ H, tLow: 120, head: 4, legs: [{ ankle, bend: 1, footAng: 90 }], arms: [{ hand: [6, 44], bend: -1 }] });
    const A = mk([46, 66]);
    const B = mk([74.6, 66]);
    const scene = b => {
      const an = b.legs[0].an; const px = an[0] + 6;
      const p = [floor(-60, 110), ...back, bar([px, 34], [px, 100], 6, 'frame'), ln([px + 3, 60], [104, 60], 3, 'frame')];
      drawSide(b, p); return p;
    };
    return {
      view: 'side', labels: ['Bottom', 'Top'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: A.H, o: [-6, -16] }, { n: 2, p: A.legs[0].toe, o: [16, 6] }, { n: 3, p: A.legs[0].k, o: [0, 16] }],
        [{ n: 4, p: B.legs[0].k, o: [0, 16] }],
      ],
    };
  };

  EX.split_squat = () => {
    const benchTop = 46;
    const bench = [pad([-122, benchTop], [-60, benchTop], 7), ln([-90, 39], [-90, 0], 4, 'frame'), ln([-112, 0], [-68, 0], 4, 'frame')];
    const front = { ankle: [0, 7], bend: 1, flat: true };
    const rear = { ankle: [-66, 53], bend: 1, footAng: 168, far: true };
    const mk = (H, t) => {
      const b0 = side({ H, tLow: t, legs: [front, rear] });
      const chest = P(b0.S, t - 90, 15);
      const hand = [chest[0], chest[1] - 12];
      return side({ H, tLow: t, legs: [front, rear], arms: [{ hand, bend: -1 }] });
    };
    const A = mk([-22, 89], 82);
    const B = mk([-30, 53], 76);
    const scene = b => { const p = [floor(-130, 40), ...bench]; drawSide(b, p, { mid: dbSide(b.arms[0].h, 90, 24) }); return p; };
    return {
      view: 'side', labels: ['Top', 'Bottom'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: A.legs[1].an, o: [-4, 16] }, { n: 2, p: A.legs[0].heel, o: [-12, 14] }],
        [{ n: 3, p: B.legs[1].k, o: [-16, 10] }, { n: 4, p: B.arms[0].h, o: [18, 6] }],
      ],
    };
  };

  EX.rdl = () => {
    const leg = { ankle: [0, 7], bend: 1, flat: true };
    const A0 = side({ H: [-2, 92], tLow: 90, legs: [leg] });
    const A = side({ H: [-2, 92], tLow: 90, legs: [leg], arms: [{ hand: [5, A0.S[1] - 57], bend: -1 }] });
    const Hb = [-35, 85];
    const B0 = side({ H: Hb, tLow: 25, head: -6, legs: [leg] });
    const B = side({ H: Hb, tLow: 25, head: -6, legs: [leg], arms: [{ hand: [B0.S[0] - 6, B0.S[1] - 58], bend: -1 }] });
    const scene = b => { const p = [floor(-60, 50)]; drawSide(b, p, { mid: dbEnd(b.arms[0].h, 8) }); return p; };
    return {
      view: 'side', labels: ['Start', 'Bottom'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: A.legs[0].k, o: [16, 4] }],
        [{ n: 2, p: B.H, o: [-14, 12] }, { n: 3, p: B.M, o: [-2, 18] }, { n: 4, p: B.arms[0].h, o: [16, -6] }],
      ],
    };
  };

  EX.leg_curl = () => {
    const seat = seatWithBack(-18, 26, 46, 100, 66);
    const H = [-6, 55];
    const K = P(H, -2, L.thigh);
    const thighPad = ci([K[0] - 8, K[1] + 11], 6, 'pad');
    const mk = sh => {
      const an = P(K, sh, L.shank);
      const b = side({ H, tLow: 100, legs: [{ ankle: an, bend: 1, footAng: sh + 90 }], arms: [{ hand: [8, 47], bend: -1 }] });
      return { b, an, padP: add(P(an, sh + 180, 10), dir(sh - 90), 9) };
    };
    const A = mk(-14), B = mk(-112);
    const scene = o => { const p = [floor(-40, 100), ...seat, thighPad, ci(K, 4, 'pivot'), ln(K, o.padP, 3, 'frame'), ci(o.padP, 6, 'pad')]; drawSide(o.b, p); return p; };
    return {
      view: 'side', labels: ['Start', 'Curl'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: K, o: [4, -18] }, { n: 2, p: [K[0] - 8, K[1] + 11], o: [-6, 18] }, { n: 3, p: A.padP, o: [14, -10] }],
        [{ n: 4, p: B.b.M, o: [-18, 0] }],
      ],
    };
  };

  EX.adduction = () => {
    const seat = [pl([[-34, 40], [34, 40], [34, 48], [-34, 48]], 'pad'), pl([[-24, 50], [24, 50], [24, 118], [-24, 118]], 'padback')];
    const mk = k => front({ hipY: 56, shY: 106, arm: { up: 272, fore: 300 }, leg: { knee: [k, 52], ankle: [k + 2, 14] } });
    const A = mk(40), B = mk(12);
    const scene = f => {
      const p = []; drawFront(f, p, { behind: [...seat] });
      f.sides.forEach(sd => p.push(bar([sd.k[0] - 7 * sd.s, sd.k[1] - 12], [sd.k[0] - 7 * sd.s, sd.k[1] + 8], 6, 'padhi')));
      p.push(floor(-70, 70)); return p;
    };
    return {
      view: 'front', labels: ['Open', 'Squeeze'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: [A.sides[0].k[0] - 7, 52], o: [-14, 16] }, { n: 2, p: A.sides[1].k, o: [-6, 18] }],
        [{ n: 3, p: [0, 50], o: [0, -20] }, { n: 4, p: [0, 90], o: [30, 6] }],
      ],
    };
  };

  EX.calf_raise = () => {
    const B = [2, 14];
    const step = pl([[-2, 0], [40, 0], [40, 12], [-2, 12]], 'frame');
    const mk = phi => {
      const toe = add(B, [11, 0]);
      const heel = P(B, phi, 21);
      const an = add(P(B, phi, 14), dir(phi - 90), 8);
      const K = P(an, 86, L.shank);
      const H = P(K, 94, L.thigh);
      const b = side({ H, tLow: 90, legs: [{ ankle: an, bend: 1 }] });
      // replace the solved leg with the explicit one so the foot matches
      b.legs = [{ k: K, an, heel, toe }];
      const shPad = bar([b.S[0] - 12, b.S[1] + 9], [b.S[0] + 14, b.S[1] + 9], 7, 'pad');
      const hand = [b.S[0] + 14, b.S[1] + 8];
      const [e, h] = ik(b.S, hand, L.upper, L.fore, -1);
      b.arms = [{ e, h, far: true }];
      return { b, shPad, heel };
    };
    const A = mk(208), Bp = mk(148);
    const scene = o => { const p = [floor(-50, 60), step, bar([-40, 0], [-40, o.b.S[1] + 20], 6, 'frame')]; drawSide(o.b, p, { behind: [ln([-40, o.b.S[1] + 18], [o.b.S[0] - 6, o.b.S[1] + 18], 4, 'frame'), o.shPad] }); return p; };
    return {
      view: 'side', labels: ['Stretch', 'Up'],
      panels: [scene(A), scene(Bp)],
      marks: [
        [{ n: 1, p: B, o: [14, -12] }, { n: 2, p: A.heel, o: [-16, -6] }],
        [{ n: 3, p: Bp.heel, o: [-16, 2] }, { n: 4, p: Bp.b.legs[0].k, o: [16, 2] }],
      ],
    };
  };

  EX.cable_crunch = () => {
    const H = [-6, 50];
    const pulley = [70, 196];
    const kneel = { ankle: [0, 7], bend: 1 };
    const mk = (tl, tu, head) => {
      const b0 = side({ H, tLow: tl, tUp: tu, head });
      const hand = add(b0.Hc, dir(tu - 90), 4);
      const b = side({ H, tLow: tl, tUp: tu, head, arms: [{ hand: [hand[0] + 2, hand[1] - 3], bend: -1 }] });
      // kneeling leg: knee on the floor, shin back along the floor
      const K = [8, 6];
      b.legs = [{ k: K, an: [-34, 6], heel: [-36, 10], toe: [-50, 3] }];
      // re-anchor thigh: hip to knee
      return b;
    };
    const A = mk(80, 84, 0), B = mk(48, -18, -20);
    const scene = b => { const h = b.arms[0].h; const p = [floor(-60, 90), pl([[-4, 0], [22, 0], [22, 3], [-4, 3]], 'pad'), ln(h, pulley, 1.6, 'cable'), ci(pulley, 6, 'frame'), bar([82, 0], [82, 206], 6, 'frame')]; drawSide(b, p, { mid: [ci(h, 4.5, 'load')] }); return p; };
    return {
      view: 'side', labels: ['Start', 'Crunch'],
      panels: [scene(A), scene(B)],
      marks: [
        [{ n: 1, p: A.arms[0].h, o: [16, 6] }],
        [{ n: 2, p: B.S, o: [4, 20] }, { n: 3, p: B.H, o: [-18, 0] }],
      ],
    };
  };

  // ---------- SVG renderer ----------
  function bbox(panels) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    const take = (p, r = 0) => { x0 = Math.min(x0, p[0] - r); x1 = Math.max(x1, p[0] + r); y0 = Math.min(y0, p[1] - r); y1 = Math.max(y1, p[1] + r); };
    for (const prims of panels) for (const q of prims) {
      if (q.t === 'l') { take(q.a, q.w / 2); take(q.b, q.w / 2); }
      else if (q.t === 'p' || q.t === 'pl') q.pts.forEach(p => take(p, (q.w || 0) / 2));
      else if (q.t === 'c') take(q.p, q.r);
    }
    return { x0, x1, y0, y1 };
  }

  function render(id) {
    const ex = EX[id]();
    const bb = bbox(ex.panels);
    // include markers
    ex.marks.forEach(ms => ms.forEach(m => { const q = add(m.p, m.o); bb.x0 = Math.min(bb.x0, q[0] - 8); bb.x1 = Math.max(bb.x1, q[0] + 8); bb.y0 = Math.min(bb.y0, q[1] - 8); bb.y1 = Math.max(bb.y1, q[1] + 8); }));
    const pad = 6, w = bb.x1 - bb.x0 + pad * 2, h = bb.y1 - bb.y0 + pad * 2, gap = 14, lab = 16;
    const W = w * 2 + gap, Hh = h + lab;
    const tx = (p, i) => [(p[0] - bb.x0 + pad + i * (w + gap)).toFixed(1), (bb.y1 - p[1] + pad + lab).toFixed(1)];
    let s = `<svg viewBox="0 0 ${W.toFixed(0)} ${Hh.toFixed(0)}" class="fig" style="max-width:${(W * 0.95).toFixed(0)}px" role="img" aria-label="${id.replace(/_/g, ' ')}: ${ex.labels.join(' and ')} positions">`;
    ex.panels.forEach((prims, i) => {
      s += `<text x="${(i * (w + gap) + w / 2).toFixed(1)}" y="11" class="fl" text-anchor="middle">${ex.labels[i]}</text>`;
      for (const q of prims) {
        if (q.t === 'l') { const a = tx(q.a, i), b = tx(q.b, i); s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke-width="${q.w}" class="s-${q.c}"/>`; }
        else if (q.t === 'pl') s += `<polyline points="${q.pts.map(p => tx(p, i).join(',')).join(' ')}" stroke-width="${q.w}" class="s-${q.c}" fill="none"/>`;
        else if (q.t === 'p') s += `<polygon points="${q.pts.map(p => tx(p, i).join(',')).join(' ')}" class="f-${q.c}"/>`;
        else if (q.t === 'c') { const c = tx(q.p, i); s += `<circle cx="${c[0]}" cy="${c[1]}" r="${q.r}" class="c-${q.c}"/>`; }
      }
      for (const m of ex.marks[i] || []) {
        const a = tx(m.p, i), b = tx(add(m.p, m.o), i);
        s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="mk-l"/><circle cx="${b[0]}" cy="${b[1]}" r="7.5" class="mk-c"/><text x="${b[0]}" y="${(+b[1] + 3.6).toFixed(1)}" class="mk-t" text-anchor="middle">${m.n}</text>`;
      }
    });
    if (true) { const ax = w + gap / 2; s += `<path d="M${(ax - 4).toFixed(1)} ${(Hh / 2).toFixed(1)} l6 0 m-3 -3 l3 3 l-3 3" class="arr"/>`; }
    return s + '</svg>';
  }
  return { render, ids: Object.keys(EX) };
})();
if (typeof module !== 'undefined') module.exports = FIG;
