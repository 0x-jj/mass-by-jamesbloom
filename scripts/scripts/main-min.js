/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const LIVE_MODE = true;
const placeholderSalePrice = 3e17;
{
  var MersenneTwister = function (e) {
    if (e == undefined) {
      e = new Date().getTime();
    }
    this.N = 624;
    this.M = 397;
    this.MATRIX_A = 2567483615;
    this.UPPER_MASK = 2147483648;
    this.LOWER_MASK = 2147483647;
    this.mt = new Array(this.N);
    this.mti = this.N + 1;
    if (e.constructor == Array) {
      this.init_by_array(e, e.length);
    } else {
      this.init_seed(e);
    }
  };
  MersenneTwister.prototype.init_seed = function (e) {
    this.mt[0] = e >>> 0;
    for (this.mti = 1; this.mti < this.N; this.mti++) {
      var e = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
      this.mt[this.mti] =
        ((((e & 4294901760) >>> 16) * 1812433253) << 16) + (e & 65535) * 1812433253 + this.mti;
      this.mt[this.mti] >>>= 0;
    }
  };
  MersenneTwister.prototype.init_by_array = function (e, a) {
    var t, i, n;
    this.init_seed(19650218);
    t = 1;
    i = 0;
    n = this.N > a ? this.N : a;
    for (; n; n--) {
      var r = this.mt[t - 1] ^ (this.mt[t - 1] >>> 30);
      this.mt[t] =
        (this.mt[t] ^ (((((r & 4294901760) >>> 16) * 1664525) << 16) + (r & 65535) * 1664525)) + e[i] + i;
      this.mt[t] >>>= 0;
      t++;
      i++;
      if (t >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        t = 1;
      }
      if (i >= a) i = 0;
    }
    for (n = this.N - 1; n; n--) {
      var r = this.mt[t - 1] ^ (this.mt[t - 1] >>> 30);
      this.mt[t] =
        (this.mt[t] ^ (((((r & 4294901760) >>> 16) * 1566083941) << 16) + (r & 65535) * 1566083941)) - t;
      this.mt[t] >>>= 0;
      t++;
      if (t >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        t = 1;
      }
    }
    this.mt[0] = 2147483648;
  };
  MersenneTwister.prototype.random_int = function () {
    var e;
    var a = new Array(0, this.MATRIX_A);
    if (this.mti >= this.N) {
      var t;
      if (this.mti == this.N + 1) this.init_seed(5489);
      for (t = 0; t < this.N - this.M; t++) {
        e = (this.mt[t] & this.UPPER_MASK) | (this.mt[t + 1] & this.LOWER_MASK);
        this.mt[t] = this.mt[t + this.M] ^ (e >>> 1) ^ a[e & 1];
      }
      for (; t < this.N - 1; t++) {
        e = (this.mt[t] & this.UPPER_MASK) | (this.mt[t + 1] & this.LOWER_MASK);
        this.mt[t] = this.mt[t + (this.M - this.N)] ^ (e >>> 1) ^ a[e & 1];
      }
      e = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
      this.mt[this.N - 1] = this.mt[this.M - 1] ^ (e >>> 1) ^ a[e & 1];
      this.mti = 0;
    }
    e = this.mt[this.mti++];
    e ^= e >>> 11;
    e ^= (e << 7) & 2636928640;
    e ^= (e << 15) & 4022730752;
    e ^= e >>> 18;
    return e >>> 0;
  };
  MersenneTwister.prototype.random_int31 = function () {
    return this.random_int() >>> 1;
  };
  MersenneTwister.prototype.random_incl = function () {
    return this.random_int() * (1 / 4294967295);
  };
  MersenneTwister.prototype.random = function () {
    return this.random_int() * (1 / 4294967296);
  };
  MersenneTwister.prototype.random_excl = function () {
    return (this.random_int() + 0.5) * (1 / 4294967296);
  };
  MersenneTwister.prototype.random_long = function () {
    var e = this.random_int() >>> 5,
      a = this.random_int() >>> 6;
    return (e * 67108864 + a) * (1 / 9007199254740992);
  };
}
(function (e) {
  var a = (e.noise = {});
  function t(e, a, t) {
    this.x = e;
    this.y = a;
    this.z = t;
  }
  t.prototype.dot2 = function (e, a) {
    return this.x * e + this.y * a;
  };
  t.prototype.dot3 = function (e, a, t) {
    return this.x * e + this.y * a + this.z * t;
  };
  var i = [
    new t(1, 1, 0),
    new t(-1, 1, 0),
    new t(1, -1, 0),
    new t(-1, -1, 0),
    new t(1, 0, 1),
    new t(-1, 0, 1),
    new t(1, 0, -1),
    new t(-1, 0, -1),
    new t(0, 1, 1),
    new t(0, -1, 1),
    new t(0, 1, -1),
    new t(0, -1, -1),
  ];
  var n = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99,
    37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
    57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27,
    166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102,
    143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116,
    188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126,
    255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152,
    2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113,
    224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
    81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
    61, 156, 180,
  ];
  var X = new Array(512);
  var Y = new Array(512);
  a.seed = function (e) {
    if (e > 0 && e < 1) {
      e *= 65536;
    }
    e = Math.floor(e);
    if (e < 256) {
      e |= e << 8;
    }
    for (var a = 0; a < 256; a++) {
      var t;
      if (a & 1) {
        t = n[a] ^ (e & 255);
      } else {
        t = n[a] ^ ((e >> 8) & 255);
      }
      X[a] = X[a + 256] = t;
      Y[a] = Y[a + 256] = i[t % 12];
    }
  };
  a.seed(0);
  var y = 0.5 * (Math.sqrt(3) - 1);
  var A = (3 - Math.sqrt(3)) / 6;
  var j = 1 / 3;
  var Z = 1 / 6;
  a.simplex2 = function (e, a) {
    var t, i, n;
    var r = (e + a) * y;
    var o = Math.floor(e + r);
    var s = Math.floor(a + r);
    var l = (o + s) * A;
    var c = e - o + l;
    var p = a - s + l;
    var f, d;
    if (c > p) {
      f = 1;
      d = 0;
    } else {
      f = 0;
      d = 1;
    }
    var u = c - f + A;
    var m = p - d + A;
    var g = c - 1 + 2 * A;
    var h = p - 1 + 2 * A;
    o &= 255;
    s &= 255;
    var E = Y[o + X[s]];
    var S = Y[o + f + X[s + d]];
    var b = Y[o + 1 + X[s + 1]];
    var v = 0.5 - c * c - p * p;
    if (v < 0) {
      t = 0;
    } else {
      v *= v;
      t = v * v * E.dot2(c, p);
    }
    var x = 0.5 - u * u - m * m;
    if (x < 0) {
      i = 0;
    } else {
      x *= x;
      i = x * x * S.dot2(u, m);
    }
    var T = 0.5 - g * g - h * h;
    if (T < 0) {
      n = 0;
    } else {
      T *= T;
      n = T * T * b.dot2(g, h);
    }
    return 70 * (t + i + n);
  };
  a.simplex3 = function (e, a, t) {
    var i, n, r, o;
    var s = (e + a + t) * j;
    var l = Math.floor(e + s);
    var c = Math.floor(a + s);
    var p = Math.floor(t + s);
    var f = (l + c + p) * Z;
    var d = e - l + f;
    var u = a - c + f;
    var m = t - p + f;
    var g, h, E;
    var S, b, v;
    if (d >= u) {
      if (u >= m) {
        g = 1;
        h = 0;
        E = 0;
        S = 1;
        b = 1;
        v = 0;
      } else if (d >= m) {
        g = 1;
        h = 0;
        E = 0;
        S = 1;
        b = 0;
        v = 1;
      } else {
        g = 0;
        h = 0;
        E = 1;
        S = 1;
        b = 0;
        v = 1;
      }
    } else {
      if (u < m) {
        g = 0;
        h = 0;
        E = 1;
        S = 0;
        b = 1;
        v = 1;
      } else if (d < m) {
        g = 0;
        h = 1;
        E = 0;
        S = 0;
        b = 1;
        v = 1;
      } else {
        g = 0;
        h = 1;
        E = 0;
        S = 1;
        b = 1;
        v = 0;
      }
    }
    var x = d - g + Z;
    var T = u - h + Z;
    var y = m - E + Z;
    var A = d - S + 2 * Z;
    var R = u - b + 2 * Z;
    var w = m - v + 2 * Z;
    var C = d - 1 + 3 * Z;
    var D = u - 1 + 3 * Z;
    var N = m - 1 + 3 * Z;
    l &= 255;
    c &= 255;
    p &= 255;
    var M = Y[l + X[c + X[p]]];
    var P = Y[l + g + X[c + h + X[p + E]]];
    var _ = Y[l + S + X[c + b + X[p + v]]];
    var H = Y[l + 1 + X[c + 1 + X[p + 1]]];
    var O = 0.6 - d * d - u * u - m * m;
    if (O < 0) {
      i = 0;
    } else {
      O *= O;
      i = O * O * M.dot3(d, u, m);
    }
    var F = 0.6 - x * x - T * T - y * y;
    if (F < 0) {
      n = 0;
    } else {
      F *= F;
      n = F * F * P.dot3(x, T, y);
    }
    var U = 0.6 - A * A - R * R - w * w;
    if (U < 0) {
      r = 0;
    } else {
      U *= U;
      r = U * U * _.dot3(A, R, w);
    }
    var k = 0.6 - C * C - D * D - N * N;
    if (k < 0) {
      o = 0;
    } else {
      k *= k;
      o = k * k * H.dot3(C, D, N);
    }
    return 32 * (i + n + r + o);
  };
  function E(e) {
    return e * e * e * (e * (e * 6 - 15) + 10);
  }
  function S(e, a, t) {
    return (1 - t) * e + t * a;
  }
  a.perlin2 = function (e, a) {
    var t = Math.floor(e),
      i = Math.floor(a);
    e = e - t;
    a = a - i;
    t = t & 255;
    i = i & 255;
    var n = Y[t + X[i]].dot2(e, a);
    var r = Y[t + X[i + 1]].dot2(e, a - 1);
    var o = Y[t + 1 + X[i]].dot2(e - 1, a);
    var s = Y[t + 1 + X[i + 1]].dot2(e - 1, a - 1);
    var l = E(e);
    return S(S(n, o, l), S(r, s, l), E(a));
  };
  a.perlin3 = function (e, a, t) {
    var i = Math.floor(e),
      n = Math.floor(a),
      r = Math.floor(t);
    e = e - i;
    a = a - n;
    t = t - r;
    i = i & 255;
    n = n & 255;
    r = r & 255;
    var o = Y[i + X[n + X[r]]].dot3(e, a, t);
    var s = Y[i + X[n + X[r + 1]]].dot3(e, a, t - 1);
    var l = Y[i + X[n + 1 + X[r]]].dot3(e, a - 1, t);
    var c = Y[i + X[n + 1 + X[r + 1]]].dot3(e, a - 1, t - 1);
    var p = Y[i + 1 + X[n + X[r]]].dot3(e - 1, a, t);
    var f = Y[i + 1 + X[n + X[r + 1]]].dot3(e - 1, a, t - 1);
    var d = Y[i + 1 + X[n + 1 + X[r]]].dot3(e - 1, a - 1, t);
    var u = Y[i + 1 + X[n + 1 + X[r + 1]]].dot3(e - 1, a - 1, t - 1);
    var m = E(e);
    var g = E(a);
    var h = E(t);
    return S(S(S(o, p, m), S(s, f, m), h), S(S(l, d, m), S(c, u, m), h), g);
  };
})(this);
function average_delta_array(a) {
  let t = 0;
  for (let e = 1; e < a.length; e++) {
    t += Math.abs(a[e] - a[e - 1]);
  }
  return t / (a.length - 1);
}
function map_scale(a, t, i) {
  if (i <= a[0]) {
    return t[0];
  }
  if (i >= a[a.length - 1]) {
    return t[t.length - 1];
  }
  for (let e = 0; e < t.length - 1; e++) {
    if ((i >= a[e]) & (i < a[e + 1])) {
      return t[e];
    }
  }
}
function delta_gap(e, a) {
  let t = average_delta_array(a);
  let i = e - a[a.length - 1];
  let n = i / t - 1;
  if (n === undefined || n === null || isNaN(n)) {
    return 0;
  } else {
    return n;
  }
}
let adjust_tier = (e, a) => {
  if (a == 0) {
    return a;
  }
  let t = a < 0 ? -1 : 1;
  a = Math.abs(a);
  if (e >= 0) {
    a -= 1;
  }
  if (e >= 1) {
    a -= 2;
  }
  if (e >= 2) {
    a -= 3;
  }
  a = Math.max(0, a) * t;
  return a == -0 ? 0 : a;
};
function calculateTiers(e) {
  if (!e) {
    console.warn("No data");
    return;
  }
  let a = {
    royalty: [
      [-0.4, -0.3, -0.1, 0, 0.1, 0.3, 0.6],
      [-3, -2, -1, 0, 1, 2, 3],
    ],
    contract_activity: [
      [-1, -0.5, -0.25, 0, 0.25, 0.5, 0.75],
      [-3, -2, -1, 0, 1, 2, 3],
    ],
    clustering_mode: [
      [-1, -0.5, -0.25, 0, 0.25, 0.5, 0.75],
      [-3, -2, -1, 0, 1, 2, 3],
    ],
    approvals: [
      [-1, -0.5, -0.25, 0, 0.25, 0.5, 0.75],
      [-3, -2, -1, 0, 1, 2, 3],
    ],
  };
  let t = new Date().getTime() / 1e3;
  let i = e[0];
  let n = e[1];
  let r = e[2];
  let o = e[3];
  let s = e[4];
  let l = e[5];
  let c = e[6];
  n = [...new Set(n)];
  r = [...new Set(r)];
  o = [...new Set(o)];
  c = [...new Set(c)];
  n.sort();
  r.sort();
  o.sort();
  c.sort();
  if (resetTimestamp) {
    console.log("Resetting to", resetTimestamp);
    n = n.filter((e) => e > resetTimestamp);
    r = r.filter((e) => e > resetTimestamp);
    o = o.filter((e) => e > resetTimestamp);
    c = c.filter((e) => e > resetTimestamp);
  }
  let p = Array.from(r);
  let f = Array.from(o);
  let d = Array.from(n);
  let u = Array.from(s);
  if (n.length <= 1) {
    d = [contractMintTimestamp].concat(n);
  }
  if (c.length <= 1) {
    c = [contractMintTimestamp].concat(c);
  }
  if (r.length <= 1) {
    p = [contractMintTimestamp].concat(r);
  }
  if (o.length <= 1) {
    f = [contractMintTimestamp].concat(o);
  }
  if (s.length <= 1) {
    u = [royaltyPercent * placeholderSalePrice].concat(s);
  }
  let m = delta_gap(t, n.length > 1 ? n : d);
  let g = delta_gap(t, r.length > 1 ? r : p);
  let h = delta_gap(t, o.length > 1 ? o : f);
  let E = 0;
  if (u.length > 1) {
    E = u[u.length - 1] / (u.slice(0, -1).reduce((e, a) => e + a) / (u.length - 1)) - 1;
  }
  let S = delta_gap(t, n.concat(p).sort().slice(-5));
  let b = adjust_tier(h, map_scale(a.royalty[0], a.royalty[1], E));
  let v = adjust_tier(m, map_scale(a.contract_activity[0], a.contract_activity[1], S * -1));
  let x = adjust_tier(m, map_scale(a.clustering_mode[0], a.clustering_mode[1], m * -1));
  let T = adjust_tier(g, map_scale(a.approvals[0], a.approvals[1], g * -1));
  let y = true;
  let A = true;
  let R = true;
  let w = true;
  if (SCENE.data.contract.tiers && Object.keys(SCENE.data.contract.tiers).length > 0) {
    y = SCENE.data.contract.tiers.royalty_received_tier.value != b;
    A = SCENE.data.contract.tiers.contract_activity_tier.value != v;
    R = SCENE.data.contract.tiers.sends_tier.value != x;
    w = SCENE.data.contract.tiers.approvals_tier.value != T;
  }
  SCENE.data.contract.tiers = {
    royalty_received_tier: { value: b, changed: y },
    contract_activity_tier: { value: v, changed: A },
    sends_tier: { value: x, changed: R },
    approvals_tier: { value: T, changed: w },
  };
}
function calculateContractDataUpdates() {
  if (!SCENE.data.contractUpdates) {
    SCENE.data.contractUpdates = {};
  }
  if (!SCENE.data.contractPrev || !(SCENE.data.contractPrev.length || SCENE.data.contractPrev.size)) {
    SCENE.data.contractUpdates.approvalCount = false;
    SCENE.data.contractUpdates.transferCount = false;
    SCENE.data.contractUpdates.holderCount = false;
    SCENE.data.contractUpdates.royalty = false;
    return;
  }
  SCENE.data.contractUpdates.approvalCount = SCENE.data.contractPrev[0][0] != SCENE.data.contract[0][0];
  SCENE.data.contractUpdates.transferCount = SCENE.data.contractPrev[2][0] != SCENE.data.contract[2][0];
  SCENE.data.contractUpdates.holderCount = SCENE.data.contractPrev[4][0] != SCENE.data.contract[4][0];
  SCENE.data.contractUpdates.royalty =
    SCENE.data.contractPrev[5].slice(
      SCENE.data.contractPrev[5].length - 2,
      SCENE.data.contractPrev[5].length - 1
    ) != SCENE.data.contract[5].slice(SCENE.data.contract[5].length - 2, SCENE.data.contract[5].length - 1) ||
    SCENE.data.contractPrev[6].slice(
      SCENE.data.contractPrev[6].length - 2,
      SCENE.data.contractPrev[6].length - 1
    ) != SCENE.data.contract[5].slice(SCENE.data.contract[6].length - 2, SCENE.data.contract[6].length - 1);
}
function tierToValue(e, a) {
  let t = [-3, -2, -1, 0, 1, 2, 3];
  let i = t.indexOf(a);
  return e[i];
}
var randomNumberGenerator = new MersenneTwister(new Date().getTime());
var randomNumberGeneratorSeeded = new MersenneTwister(hashString(`${tokenHash}`));
traitsSeed = Math.floor(123456789 * randomNumberGeneratorSeeded.random());
traitsIncrement = Math.floor(12345 * randomNumberGeneratorSeeded.random());
function sizeOfMapping(e) {
  return Object.keys(e).length;
}
function makeGradientPlane(e, a, t, i, n) {
  const r = document.createElement("canvas");
  r.width = 256;
  r.height = 256;
  const o = r.getContext("2d");
  if (t == "linear") {
    var s = o.createLinearGradient(0, 0, 0, r.height);
  } else if (t == "radial") {
    var s = o.createRadialGradient(r.width / 2, r.height / 2, 0, r.width / 2, r.height / 2, r.width / 2);
  }
  for (let e of i) {
    s.addColorStop(e[0], e[1]);
  }
  o.fillStyle = s;
  o.fillRect(0, 0, r.width, r.height);
  const l = new THREE.CanvasTexture(r);
  const c = new THREE.PlaneGeometry(e, a);
  const p = new THREE.MeshBasicMaterial({ map: l, fog: n });
  const f = new THREE.Mesh(c, p);
  return f;
}
function makePerlinTexture(e, a, i, n, r, o, s, l, c = "perlin3") {
  const t = document.createElement("canvas");
  t.setAttribute("id", "canvas1");
  t.width = e;
  t.height = a;
  const p = t.getContext("2d");
  if (s) {
    var f = document.createElement("canvas");
    f.width = e;
    f.height = a;
    var d = f.getContext("2d");
  }
  noise.seed(Math.random());
  let u = 0;
  for (var m = 0; m < t.width; m++) {
    for (var g = 0; g < t.height; g++) {
      u++;
      if (c == "perlin3") {
        var h = noise.perlin3(m / i, g / n, m ^ g % 150);
        var E = Math.abs(h * o) * 256 + r;
      } else if (c == "simplex3") {
        var h = noise.simplex3(m / i, g / n, m ^ g % 150);
        var E = Math.abs(h * o) * 256 + r;
      } else if (c == "simple") {
        var E = Math.random() * 255 * o + r;
      }
      let e = E;
      let a = E;
      let t = E;
      p.fillStyle = "rgb(" + e + "," + a + "," + t + ")";
      p.fillRect(m, g, 1, 1);
      if (s) {
        t = E / l;
        d.fillStyle = "rgb(" + t + "," + t + "," + t + ")";
        d.fillRect(m, g, 1, 1);
      }
    }
  }
  const S = new THREE.CanvasTexture(t);
  S.wrapS = S.wrapT = THREE.RepeatWrapping;
  if (s) {
    const b = new THREE.CanvasTexture(f);
    b.wrapS = b.wrapT = THREE.RepeatWrapping;
    return [S, b];
  } else {
    return S;
  }
}
function makeLight(e, a = true) {
  if (e.type == "point") {
    e.light = new THREE.PointLight(e.color, e.power, e.size);
    if (a) {
      e.light.position.set(e.positionX, e.positionY, e.positionZ);
    }
    if (enableShadows) {
      e.light.castShadow = true;
      e.light.shadow.mapSize.width = 512;
      e.light.shadow.mapSize.height = 512;
      e.light.shadow.camera.near = 0.5;
      e.light.shadow.camera.far = 500;
      e.light.shadow.normalBias = 0.5;
    }
  } else if (e.type == "hemisphere") {
    e.light = new THREE.HemisphereLight(e.color1, e.color2, e.power);
  } else if (e.type == "ambient") {
    e.light = new THREE.AmbientLight(e.color);
  } else if (e.type == "directional") {
    e.light = new THREE.DirectionalLight(e.color, e.power);
    e.light.position.set(e.positionX, e.positionY, e.positionZ);
    e.light.rotation.set(e.rotationX, e.rotationY, e.rotationZ);
    if (enableShadows) {
      e.light.castShadow = true;
      e.light.shadow.mapSize.width = 512;
      e.light.shadow.mapSize.height = 512;
      e.light.shadow.camera.near = 0.5;
      e.light.shadow.camera.far = 500;
      e.light.shadow.normalBias = 0.5;
    }
  }
}
function animateAxisNegativeSpace(a, e) {
  if (a.userData == undefined) {
    a.userData = {};
    a.userData.negativeSpaceTargetX = rand(
      a.negativeSpaceAnimationX[0],
      a.negativeSpaceAnimationX[1],
      a.negativeSpaceAnimationX[2]
    );
    a.userData.negativeSpaceTargetY = rand(
      a.negativeSpaceAnimationY[0],
      a.negativeSpaceAnimationY[1],
      a.negativeSpaceAnimationY[2]
    );
    a.userData.negativeSpaceCurrentX = 0;
    a.userData.negativeSpaceCurrentY = 0;
  }
  let t = 0;
  let i = 0;
  let n = a.negativeSpaceAnimationSpeedX * e;
  let r = a.negativeSpaceAnimationSpeedY * e;
  if (a.userData.negativeSpaceCurrentX < a.userData.negativeSpaceTargetX) {
    t = n;
    a.userData.negativeSpaceCurrentX += n;
  } else if (a.userData.negativeSpaceCurrentX > a.userData.negativeSpaceTargetX) {
    t = -n;
    a.userData.negativeSpaceCurrentX -= n;
  }
  if (a.userData.negativeSpaceCurrentY < a.userData.negativeSpaceTargetY) {
    i = r;
    a.userData.negativeSpaceCurrentY += r;
  } else if (a.userData.negativeSpaceCurrentY > a.userData.negativeSpaceTargetY) {
    i = -r;
    a.userData.negativeSpaceCurrentY -= r;
  }
  if (
    (a.userData.negativeSpaceTargetX >= 0 &&
      a.userData.negativeSpaceCurrentX > a.userData.negativeSpaceTargetX) ||
    (a.userData.negativeSpaceTargetX <= 0 &&
      a.userData.negativeSpaceCurrentX < a.userData.negativeSpaceTargetX)
  ) {
    a.userData.negativeSpaceTargetX = rand(
      a.negativeSpaceAnimationX[0],
      a.negativeSpaceAnimationX[1],
      a.negativeSpaceAnimationX[2]
    );
  }
  if (
    (a.userData.negativeSpaceTargetY >= 0 &&
      a.userData.negativeSpaceCurrentY > a.userData.negativeSpaceTargetY) ||
    (a.userData.negativeSpaceTargetY <= 0 &&
      a.userData.negativeSpaceCurrentY < a.userData.negativeSpaceTargetY)
  ) {
    a.userData.negativeSpaceTargetY = rand(
      a.negativeSpaceAnimationY[0],
      a.negativeSpaceAnimationX[1],
      a.negativeSpaceAnimationY[2]
    );
  }
  if (t != 0 || i != 0) {
    for (let e in a.clipPlanes) {
      a.clipPlanes[e].translate(new THREE.Vector3(t, i, 0));
    }
  }
}
function makeCamera() {
  if (cameraType == "perspective") {
    var e = new THREE.PerspectiveCamera(fieldOfView, cameraAspect, cameraNear, cameraFar);
    e.aspect = rendererWidth / rendererHeight;
  } else {
    var e = new THREE.OrthographicCamera(
      rendererWidth / -orthographicCameraScale,
      rendererWidth / orthographicCameraScale,
      rendererHeight / orthographicCameraScale,
      rendererHeight / -orthographicCameraScale,
      cameraNear,
      cameraFar
    );
  }
  cameraZ = randFromRange(cameraZ);
  e.position.x = cameraX;
  e.position.y = cameraY;
  e.position.z = cameraZ;
  e.updateProjectionMatrix();
  e.userData.animationQueue = [];
  e.userData.originalFocalLength = e.getFocalLength();
  return e;
}
function makeScene() {
  const e = new THREE.Scene();
  e.fog = new THREE.Fog(fogColor, fogNear, fogFar);
  e.fog.userData = { animationQueue: [] };
  e.fog.enabled = enableFog;
  if (!enableFog) {
    e.fog.near = 100;
    e.fog.far = 100;
    e.fog.enabled = false;
  }
  e.background = new THREE.Color(worldGradientColors[worldGradientColors.length - 1][1]);
  return e;
}
function makeRenderer() {
  const e = new THREE.WebGLRenderer({ antialias: rendererAntialias, premultipliedAlpha: true });
  e.setSize(rendererWidth, rendererHeight, false);
  e.setPixelRatio(window.devicePixelRatio);
  e.toneMapping = THREE[rendererToneMapping];
  e.localClippingEnabled = true;
  if (enableShadows) {
    e.shadowMap.enabled = true;
    e.shadowMap.type = THREE.PCFShadowMap;
  }
  document.body.appendChild(e.domElement);
  return e;
}
function loadOBJ(e, a, t, i, n) {
  const r = new THREE.OBJLoader();
  object = r.parse(atob(e));
  object.traverse(function (e) {
    e.material = a;
  });
  object.scale.set(t[0], t[1], t[2]);
  object.position.set(i[0], i[1], i[2]);
  object.rotation.set(
    THREE.MathUtils.degToRad(n[0]),
    THREE.MathUtils.degToRad(n[1]),
    THREE.MathUtils.degToRad(n[2])
  );
  return object;
}
function addPivotToAxis(e, a, t, i = undefined, n = undefined) {
  let r = new THREE.Object3D();
  r.userData.name = t;
  r.userData.shapeType = a.userData.shapeType;
  var o = rand(e.axisX[0], e.axisX[1], e.axisX[2]);
  if (i) {
    var s = randFromRange(i);
  } else {
    var s = rand(e.axisY[0], e.axisY[1], e.axisY[2]);
  }
  var l = rand(e.axisZ[0], e.axisZ[1], e.axisZ[2]);
  r.userData.rotationSpeed = rand(e.coneRotationSpeed[0], e.coneRotationSpeed[1], e.coneRotationSpeed[2]);
  r.userData.originalRotationSpeed = r.userData.rotationSpeed;
  r.rotation.z = THREE.MathUtils.degToRad(rand(e.axisAngle[0], e.axisAngle[1], e.axisAngle[2]));
  r.userData.originalPosition = [o, s, l];
  r.position.set(o, s, l);
  r.add(a);
  e.pivots.push(r);
  e.mainPivot.add(r);
  if (n == undefined) {
    return;
  }
  if (r.userData.name.includes("terrain")) {
    n *= terrainsAppearAndDisappearMultiplier;
  }
  if (r.userData.name.includes("knot")) {
    n *= knotsAppearAndDisappearMultiplier;
  }
  r.children[0].userData.originalScale = JSON.parse(JSON.stringify(r.children[0].scale));
  r.userData.growUp = n;
  r.children[0].scale.set(0, 0, 0);
}
function addConeToAxis(e, a, t, i = undefined, n = undefined) {
  let r = rand(t.radius[0], t.radius[1], t.radius[2]);
  let o = rand(t.height[0], t.height[1], t.height[2]);
  let s = rand(t.scale[0], t.scale[1], t.scale[2]);
  let l = s + rand(t.scaleX[0], t.scaleX[1], t.scaleX[2]);
  let c = s + rand(t.scaleY[0], t.scaleY[1], t.scaleY[2]);
  let p = s + rand(t.scaleZ[0], t.scaleZ[1], t.scaleZ[2]);
  let f = rand(t.positionX[0], t.positionX[1], t.positionX[2]);
  let d = rand(t.positionY[0], t.positionY[1], t.positionY[2]);
  let u = rand(t.positionZ[0], t.positionZ[1], t.positionZ[2]);
  let m = rand(t.rotationX[0], t.rotationX[1], t.rotationX[2]);
  let g = rand(t.rotationY[0], t.rotationY[1], t.rotationY[2]);
  let h = rand(t.rotationZ[0], t.rotationZ[1], t.rotationZ[2]);
  let E = t.numberOfRadialSegments;
  let S = t.numberOfHeightSegments;
  let b = t.openEnded;
  if (e.ellipseMode) {
    f *= Math.pow(20 - Math.abs(d), e.ellipseModePowerOf) * e.ellipseModeMultiplier;
    u *= Math.pow(20 - Math.abs(d), e.ellipseModePowerOf) * e.ellipseModeMultiplier;
  }
  if (e.enableScaleEllipseMode) {
    l *=
      Math.pow(e.scaleEllipseModeBaseX - Math.abs(d), e.scaleEllipseModePowerOfX) *
      e.scaleEllipseModeMultiplierX;
    c *=
      Math.pow(e.scaleEllipseModeBaseY - Math.abs(d), e.scaleEllipseModePowerOfY) *
      e.scaleEllipseModeMultiplierY;
    p *=
      Math.pow(e.scaleEllipseModeBaseZ - Math.abs(d), e.scaleEllipseModePowerOfZ) *
      e.scaleEllipseModeMultiplierZ;
  }
  let v = {};
  for (let e = 0; e < 100; e++) {
    let e = t.types[randS(0, t.types.length - 1, 1)];
    if (randS(0, 1, 0.1) > 1 - e.probability) {
      v = e;
      break;
    }
  }
  try {
    var x = materialTemplates[t.material].clone();
  } catch (y) {
    console.warn(t);
    var x = materialTemplates[pick(t.material)[1]].clone();
  }
  if (t.wireframeProbability && randS(0, 1, 0.01) > 1 - t.wireframeProbability) {
    x.wireframe = true;
    E = 5;
    S = 5;
    b = true;
  } else {
    x.wireframe = false;
  }
  if (e.clipPlanes && e.clipPlanes.length > 0) {
    x.clippingPlanes = e.clipPlanes;
  }
  let T = makeCone(x, r, o, E, S, b, [l, c, p], [f, d, u], [m, g, m], v);
  if (i) {
    let e = Math.max(l, c, p);
    let a = (e / 100) * i;
    a = Math.max(a, 1e-7);
    T.scale.set(0, 0, 0);
    T.userData.animationQueue = [makeAnimationForQueue("scale", 0, e, e, a)];
  }
  if (e.enableNegativeSpace) {
    T.material.clippingPlanes = e.clipPlanes;
    T.material.clipIntersection = true;
  }
  T.userData.name = a;
  T.userData.shapeType = n;
  addPivotToAxis(e, T, a);
}
function animateWorldPlane() {
  if (!SCENE.worldPlane.userData.animationQueue) {
    if (
      (SCENE.worldPlane.scale.x > 1 + SCENE.worldPlane.userData.scaleAmount &&
        SCENE.worldPlane.userData.scaleFactor > 0) ||
      (SCENE.worldPlane.scale.x < 1 && SCENE.worldPlane.userData.scaleFactor < 0)
    ) {
      SCENE.worldPlane.userData.scaleFactor *= -1;
    }
    SCENE.worldPlane.scale.set(
      SCENE.worldPlane.scale.x + SCENE.worldPlane.userData.scaleFactor,
      SCENE.worldPlane.scale.y + SCENE.worldPlane.userData.scaleFactor,
      1
    );
  }
}
function makeWorldPlane() {
  worldPlane = makeGradientPlane(
    rendererWidth * 3,
    rendererWidth * 3,
    worldGradientType,
    worldGradientColors,
    false
  );
  worldPlane.userData.name = "worldPlane";
  worldPlane.position.z = -rendererWidth;
  worldPlane.z = -100;
  worldPlane.userData.scaleFactor = rand(
    worldGradientAnimationSpeed[0],
    worldGradientAnimationSpeed[1],
    worldGradientAnimationSpeed[2]
  );
  worldPlane.userData.scaleAmount = rand(
    worldGradientAnimationScale[0],
    worldGradientAnimationScale[1],
    worldGradientAnimationScale[2]
  );
  worldPlane.userData.animationQueue = [];
  SCENE.worldPlane = worldPlane;
  SCENE.scene.add(SCENE.worldPlane);
}
function addExtraShapeToAxis(e, a, t, o, i = undefined) {
  let n = t;
  let r = randFromRange(o.scale);
  let s = r + randFromRange(o.scaleX);
  let l = r + randFromRange(o.scaleY);
  let c = r + randFromRange(o.scaleZ);
  let p = randFromRangeS2(o.positionX);
  let f = randFromRangeS2(o.positionY);
  let d = randFromRangeS2(o.positionZ);
  let u = randFromRange(o.rotationX);
  let m = randFromRange(o.rotationY);
  let g = randFromRange(o.rotationZ);
  if (o.material) {
    if (!materialTemplates[o.material]) {
      console.warn("Object has no material", o);
    } else {
      var h = materialTemplates[o.material].clone();
    }
  } else {
    var h = e.coneMaterial.clone();
    if (e.coneMaterial.map) {
      if (o.textureScale) {
        h.map.repeat.x = o.textureScale[0];
        h.map.repeat.y = o.textureScale[1];
      }
      if (o.textureRotation) {
        h.map.rotation = THREE.MathUtils.degToRad(o.textureRotation);
        h.map.rotation = true;
      }
    }
    if (o.color) {
      h.color = new THREE.Color(o.color);
      h.color.needsUpdate = true;
    }
  }
  if (e.clipPlanes && e.clipPlanes.length > 0) {
    h.clippingPlanes = e.clipPlanes;
  }
  if (n == "flower1") {
    h.map = undefined;
    h.bumpMap = undefined;
    let a = h.clone();
    if (SCENE.palette.special) {
      h.color = new THREE.Color(SCENE.palette.special.flower[0]);
      a.color = new THREE.Color(SCENE.palette.special.flower[1]);
    } else {
      let e = pickS2(SCENE.palette.colors);
      h.color = new THREE.Color(e[0]);
      a.color = new THREE.Color(e[1]);
    }
    h = [h, a];
  }
  let E = undefined;
  if (n == "terrain") {
    let e = randFromRange(o.heightScale);
    E = makeTerrain(h, o.worldSizeX, o.worldSizeY, e, [s, l, c], [p, f, d], [u, m, g]);
  }
  if (n == "smallterrain") {
    let e = randFromRange(o.heightScale);
    E = makeTerrain(
      h,
      o.worldSizeX,
      o.worldSizeY,
      e,
      [s, l, c],
      [p, f, d],
      [u, m, g],
      1,
      o.bumpsRange,
      o.depth
    );
  } else if (n == "cloud") {
    let e = randFromRange(o.sizeX);
    let a = randFromRange(o.sizeY);
    let t = randFromRange(o.sizeZ);
    let i = randFromRange(o.nSpheres);
    E = makeCloud(h, e, a, t, i, o.spheresScale, [s, l, c], [p, f, d], [u, m, g]);
  } else if (n == "frame") {
    let e = randFromRange(o.height);
    let a = randFromRange(o.width);
    let t = randFromRange(o.thickness);
    let i = randFromRange(o.depth);
    E = makeFrame(h, e, a, t, i, [s, l, c], [p, f, d], [u, m, g]);
  } else if (n == "rectangle") {
    let e = randFromRange(o.height);
    let a = randFromRange(o.width);
    let t = randFromRange(o.depth);
    E = makeRectangle(h, e, a, t, [s, l, c], [p, f, d], [u, m, g]);
  } else if (n == "arrow") {
    let e = randFromRange(o.depth);
    let a = randFromRange(o.bevelThickness);
    let t = randFromRange(o.bevelSize);
    let i = randFromRange(o.bevelSegments);
    let n = o.type || 0;
    E = makeArrow(h, e, a, t, i, [s, l, c], [p, f, d], [u, m, g], n);
  } else if (n == "knot") {
    let e = randFromRange(o.radius);
    let a = randFromRange(o.tube);
    let t = randFromRange(o.tubularSegments);
    let i = randFromRange(o.radialSegments);
    let n = randFromRange(o.p);
    let r = randFromRange(o.q);
    E = makeKnot(h, e, a, t, i, n, r, [s, l, c], [p, f, d], [u, m, g]);
  } else if (n in base64Objects) {
    E = loadOBJ(base64Objects[n], h, [s, l, c], [p, f, d], [u, m, g]);
  }
  E.userData.name = a;
  E.name = a;
  E.userData.shapeType = n;
  if (e.enableNegativeSpace) {
    E.material.clippingPlanes = e.clipPlanes;
    E.material.clipIntersection = true;
  }
  addPivotToAxis(e, E, a, o.yAxisRangeOverwrite, i);
}
function updateObjectRotationSpeed(a, t, i, n = 1, r = 0.1) {
  for (let e of Axis) {
    if (e.name == t) {
      for (let t of e.pivots) {
        if (t.userData.name == a) {
          let e = t.userData.rotationSpeed;
          if (e === undefined) {
            e = 0;
          }
          let a = makeAnimationForQueue("rotationSpeed", e, i, i, n, r);
          if (t.userData.animationQueue === undefined) {
            t.userData.animationQueue = [];
          }
          t.userData.animationQueue.push(a);
          return;
        }
      }
    }
  }
}
function switchObjectRotationDirection(a, t, i = 1, n = 0.1) {
  for (let e of Axis) {
    if (e.name == t) {
      for (let t of e.pivots) {
        if (t.userData.name == a) {
          let e = t.userData.rotationSpeed;
          if (e === undefined) {
            e = 0;
          }
          let a = makeAnimationForQueue("rotationSpeed", e, e * -1, e * -1, i, n);
          if (t.userData.animationQueue === undefined) {
            t.userData.animationQueue = [];
          }
          t.userData.animationQueue.push(a);
          return;
        }
      }
    }
  }
}
function updateObjectDistanceFromAxis(i, e, n, r = 1, o = 0.1) {
  for (let a of Axis) {
    if (a.name == e) {
      for (let e of a.pivots) {
        if (e.userData.name == i) {
          for (let t of e.children) {
            if (t.userData.name == i) {
              let e = t.position.x;
              let a = makeAnimationForQueue("distance", e, n, n, r, o);
              if (t.userData.animationQueue === undefined) {
                t.userData.animationQueue = [];
              }
              t.userData.animationQueue.push(a);
            }
          }
        }
      }
    }
  }
}
function updateBackgroundGradientScale(e, a = 1, t = 0.1) {
  let i = Math.max(SCENE.worldPlane.scale.x, SCENE.worldPlane.scale.y);
  SCENE.worldPlane.userData.animationQueue.push(makeAnimationForQueue("scale", i, e, e, a, t));
}
function updateCameraPosition(e, a, t, i = 1, n = 0.1) {
  if (e !== undefined) {
    SCENE.camera.userData.animationQueue.push(
      makeAnimationForQueue("x", SCENE.camera.position.x, e, e, i, n)
    );
  }
  if (a !== undefined) {
    SCENE.camera.userData.animationQueue.push(
      makeAnimationForQueue("y", SCENE.camera.position.y, a, a, i, n)
    );
  }
  if (t !== undefined) {
    SCENE.camera.userData.animationQueue.push(
      makeAnimationForQueue("z", SCENE.camera.position.z, t, t, i, n)
    );
  }
}
function updateObjectScale2(e, a, t = 1, i = 0.1) {
  let n = makeAnimationForQueue("scale", [e.scale.x, e.scale.y, e.scale.z], [a, a, a], [a, a, a], t, i);
  if (e.userData.animationQueue == undefined) {
    e.userData.animationQueue = [];
  }
  e.userData.animationQueue.push(n);
}
function addNewShape(e, a, t, i, n = false) {
  for (ax of Axis) {
    shapeParams = extraShapes[t];
    if (ax.name == e) {
      if (n) {
        let a = false;
        for (let e of ax.pivots) {
          if (e.userData.name.slice(0, t.length) == t) {
            a = true;
            break;
          }
        }
        if (!a) {
          continue;
        }
      }
      if (shapeParams.cone) {
        addConeToAxis(ax, a, shapeParams, i, t);
        return;
      } else {
        if (t.includes("terrain")) {
          i *= terrainsAppearAndDisappearMultiplier;
        }
        if (t.includes("knot")) {
          i *= knotsAppearAndDisappearMultiplier;
        }
        addExtraShapeToAxis(ax, a, t, shapeParams, i);
      }
    }
  }
}
function rotateAxis(a, t, i, n, r = 1, o = 0.1) {
  for (let e of Axis) {
    if (e.name == a) {
      if (e.mainPivot.userData.animationQueue == undefined) {
        e.mainPivot.userData.animationQueue = [];
      }
      if (t !== undefined) {
        t = THREE.MathUtils.degToRad(t);
        e.mainPivot.userData.animationQueue.push(
          makeAnimationForQueue("angleX", e.mainPivot.rotation.x, t, t, r, o)
        );
      }
      if (i !== undefined) {
        i = THREE.MathUtils.degToRad(i);
        e.mainPivot.userData.animationQueue.push(
          makeAnimationForQueue("angleY", e.mainPivot.rotation.y, i, i, r, o)
        );
      }
      if (n !== undefined) {
        n = THREE.MathUtils.degToRad(n);
        e.mainPivot.userData.animationQueue.push(
          makeAnimationForQueue("angleZ", e.mainPivot.rotation.z, n, n, r, o)
        );
      }
    }
  }
}
function moveAxis(a, t, i, n, r = 1, o = 0.1) {
  for (let e of Axis) {
    if (e.name == a) {
      if (e.mainPivot.userData.animationQueue == undefined) {
        e.mainPivot.userData.animationQueue = [];
      }
      if (t !== undefined) {
        t = THREE.MathUtils.degToRad(t);
        e.mainPivot.userData.animationQueue.push(
          makeAnimationForQueue("x", e.mainPivot.position.x, t, t, r, o)
        );
      }
      if (i !== undefined) {
        i = THREE.MathUtils.degToRad(i);
        e.mainPivot.userData.animationQueue.push(
          makeAnimationForQueue("y", e.mainPivot.position.y, i, i, r, 0.1)
        );
      }
      if (n !== undefined) {
        n = THREE.MathUtils.degToRad(n);
        e.mainPivot.userData.animationQueue.push(
          makeAnimationForQueue("z", e.mainPivot.position.z, n, n, r, 0.1)
        );
      }
    }
  }
}
function getObjectVertexXYZ(e, t, i) {
  for (let a of Axis) {
    if (a.name == e) {
      for (let e of a.pivots) {
        if (e.userData.name == t) {
          for (child of e.children) {
            let e = child.geometry.getAttribute("position");
            if (i == undefined) {
              i = rand(0, e.count, 1);
            }
            let a = new THREE.Vector3(e.getX(i), e.getY(i), e.getZ(i));
            a.applyMatrix4(child.matrixWorld);
            return a;
          }
        }
      }
    }
  }
}
function addRotationLoop(t, e, n, r) {
  for (let a of Axis) {
    if (a.name == e) {
      for (let e of a.pivots) {
        if (e.userData.name == t) {
          for (let i of e.children) {
            if (i.userData.name == t) {
              let e;
              let a;
              if (n == "X") {
                e = "angleX";
                a = i.rotation.x;
              } else if (n == "Y") {
                e = "angleY";
                a = i.rotation.y;
              } else if (n == "Z") {
                e = "angleZ";
                a = i.rotation.z;
              }
              let t = makeAnimationForQueue(e, a, a + 1, a + 1, r, undefined);
              if (i.userData.animationLoop === undefined) {
                i.userData.animationLoop = [];
              }
              i.userData.animationLoop.push(t);
            }
          }
        }
      }
    }
  }
}
function removeRotationLoop(i, e, n) {
  for (let a of Axis) {
    if (a.name == e) {
      for (let e of a.pivots) {
        if (e.userData.name == i) {
          for (let t of e.children) {
            if (t.userData.name == i) {
              if (t.userData.animationLoop) {
                let a;
                if (n == "X") {
                  a = "angleX";
                } else if (n == "Y") {
                  a = "angleY";
                } else if (n == "Z") {
                  a = "angleZ";
                }
                for (let e = 0; e < t.userData.animationLoop.length; e++) {
                  if (t.userData.animationLoop[e].attribute == a) {
                    t.userData.animationLoop.splice(e, 1);
                    return;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
function logDebugMessage() {
  let a = `Hash: ${tokenHash} Randomness:`;
  for (let e = 0; e < 5; e++) {
    a += " " + randS(1, 100, 1);
  }
  a += `\nPalette: ${JSON.stringify(SCENE.palette)}`;
  a += "\nAxis shapes:";
  for (let e of Axis) {
    a += "\n" + e.name + ":";
    for (shape in e.extraShapes) {
      a += " " + shape + ` [${e.extraShapes[shape].numberOfShapes} ${e.extraShapes[shape].material}]`;
    }
  }
  console.log(a);
}
async function walletActivityUpdates(e) {
  try {
    return await getLastBlockReceipts(e);
  } catch (a) {
    console.error(a);
  }
}
function disableAxis(a, t = 0.01) {
  a.enabled = false;
  for (let e of a.pivots) {
    if (!e.userData.originalScale) {
      e.userData.originalScale = e.scale.x;
    }
    updateObjectScale2(e, 0, t);
  }
}
function enableAxis(e, t = 0.01) {
  e.enabled = true;
  for (let a of e.pivots) {
    a.scale.set(0, 0, 0);
    updateObjectScale2(a, a.userData.originalScale, t);
    for (let e of a.children) {
      e.visible = true;
    }
  }
}
function axisHasAnimatingPivots(a) {
  for (let e of a.pivots) {
    if (e.userData.animationQueue && e.userData.animationQueue.length > 0) {
      return true;
    }
  }
  return false;
}
function setAxisInvisibleAndDisabled(e) {
  e.enabled = false;
  for (let a of e.pivots) {
    a.userData.originalScale = a.scale.x;
    a.scale.set(0, 0, 0);
    for (let e of a.children) {
      e.visible = false;
    }
  }
}
function disappearPivot(e, a = 0.01, t = false, i = undefined, n = undefined) {
  e.userData.disabled = true;
  if (t) {
    e.userData.toBeRemovedAfterShrink = true;
  }
  if (!e.children[0].userData.originalScale) {
    e.children[0].userData.originalScale = JSON.parse(JSON.stringify(e.children[0].scale));
  }
  if (e.userData.name.includes("terrain")) {
    a *= terrainsAppearAndDisappearMultiplier;
  }
  if (e.userData.name.includes("knot")) {
    a *= knotsAppearAndDisappearMultiplier;
  }
  if (i) {
    e.userData.delayedDisappear = true;
    setTimeout(() => {
      e.userData.shrinkDown = a;
      e.userData.delayedDisappear = false;
      e.userData.disappearCallback = n;
    }, rand(i[0], i[1], 1));
  } else {
    e.userData.shrinkDown = a;
    e.userData.disappearCallback = n;
  }
}
function disappearObjects(i, n = 0.01, r = false, o = undefined, s = undefined, l = undefined) {
  let c = 0;
  for (let e = 0; e < 500; e++) {
    let e = Axis[rand(0, Axis.length - 1, 1)];
    if (!e.enabled || !e.pivots || e.pivots.length == 0) {
      continue;
    }
    let a = rand(0, e.pivots.length - 1, 1);
    let t = e.pivots[a];
    if (t.userData.shrinkDown || t.userData.growUp) {
      continue;
    }
    if (s && t.userData.shapeType != s) {
      continue;
    }
    if (o && t.userData.name.slice(0, o.length) != o) {
      continue;
    }
    if (t.userData.disabled) {
      continue;
    }
    if (t.userData.delayedDisappear || t.userData.delayedAppear) {
      continue;
    }
    disappearPivot(t, n, r, l);
    c++;
    if (c >= i) {
      return c;
    }
  }
  return c;
}
function disappearObjectsByType(e, a = 0.01, t = false, i = undefined, n = undefined, r = undefined) {
  let o = 0;
  for (ax of Axis) {
    for (pivot of ax.pivots) {
      if (n && pivot.userData.shapeType != n) {
        continue;
      }
      if (i && pivot.userData.name.slice(0, i.length) != i) {
        continue;
      }
      disappearPivot(pivot, a, t, r);
      o++;
      if (e) {
        if (o >= e) {
          return o;
        }
      }
    }
  }
  return o;
}
function appearObjects(t, i = 0.01, n = 0.3, r = undefined) {
  let o = 0;
  for (let e = 0; e < 500; e++) {
    let e = Axis[rand(0, Axis.length - 1, 1)];
    if (!e.enabled || !e.pivots || e.pivots.length == 0) {
      continue;
    }
    let a = e.pivots[rand(0, e.pivots.length - 1, 1)];
    if (a.userData.shrinkDown || a.userData.growUp) {
      continue;
    }
    if (a.userData.delayedDisappear || a.userData.delayedAppear) {
      continue;
    }
    if (!a.userData.disabled) {
      continue;
    }
    a.userData.disabled = false;
    if (a.userData.name.includes("terrain")) {
      i *= terrainsAppearAndDisappearMultiplier;
    }
    if (a.userData.name.includes("knot")) {
      i *= knotsAppearAndDisappearMultiplier;
    }
    if (r) {
      a.userData.delayedAppear = true;
      setTimeout(() => {
        a.userData.growUp = i;
        a.userData.delayedAppear = false;
      }, rand(r[0], r[1], 1));
    } else {
      a.userData.growUp = i;
    }
    o++;
    if (o >= t) {
      break;
    }
    continue;
    if (a.children[0].userData.animationQueue && a.children[0].userData.animationQueue.length > 0) {
      continue;
    }
    if (a.userData.animationQueue && a.userData.animationQueue.length > 0) {
      continue;
    }
    if (a.userData.disabledWithTimeout) {
      continue;
    }
    if (a.children[0].userData.name.includes("terrain")) {
      i *= terrainsAppearAndDisappearMultiplier;
    }
    if (a.children[0].userData.name.includes("knot")) {
      i *= knotsAppearAndDisappearMultiplier;
    }
    if (a.userData.disabled) {
      updateObjectScale2(a.children[0], a.children[0].userData.originalScale, i, n);
      a.visible = true;
      a.userData.disabled = false;
      o++;
      if (o >= t) {
        break;
      }
    }
  }
  return o;
}
function randomContractData() {
  let e = [rand(0, 1e3, 1)];
  let a = [];
  let t = [rand(0, 1e3, 1)];
  let i = [];
  let n = [rand(20, 300, 1)];
  let r = [];
  let o = [];
  let s = [300];
  let l = 1681510366;
  let c = 1681510366;
  let p = 1681510366;
  let f = 1681510366;
  for (let e = 0; e < 200; e++) {
    l += rand(1e3, 1e6, 1);
    c += rand(1e3, 1e6, 1);
    p += rand(1e3, 1e6, 1);
    f += rand(1e3, 1e6, 1);
    a.push(l);
    i.push(c);
    r.push(p);
    r.push(rand(3e15, 6e15, 1));
    o.push(f);
    o.push(rand(3e15, 6e15, 1));
  }
  return [e, a, t, i, n, r, o, s];
}
function pickAxis(a, t = [], i = false, n = false) {
  for (let e = 0; e < 100; e++) {
    let e = rand(0, Axis.length - 1, 1);
    if (!Axis[e].pivots || Axis[e].pivots.length == 0) {
      continue;
    }
    if (n && Axis[e].extraShapes.size == 0) {
      continue;
    }
    if (t.indexOf(e) != -1 || (i && Axis[e].extremeAngle)) {
      continue;
    }
    if (Axis[e].enabled == a) {
      return Axis[e];
    }
  }
}
function getLoopingObjects() {
  let t = [];
  for (let a of Axis) {
    if (a.enabled) {
      for (let e of a.pivots) {
        if (e.children[0].userData.animationLoop || e.userData.animationLoop) {
          t.push([a.name, e]);
        }
      }
    }
  }
  return t;
}
function getNotLoopingObjects() {
  let t = [];
  for (let a of Axis) {
    if (a.enabled) {
      for (let e of a.pivots) {
        if (!e.children[0].animationLoop) {
          t.push([a.name, e]);
        }
      }
    }
  }
  return t;
}
function animateFog() {
  if (SCENE.scene.fog.userData) {
    if (SCENE.scene.fog.userData.nearTo) {
      if (SCENE.scene.fog.near < SCENE.scene.fog.userData.nearTo) {
        SCENE.scene.fog.near += dynamicUpdateAnimationSpeeds.fog.speed;
        SCENE.scene.fog.near = parseFloat(SCENE.scene.fog.near.toFixed(5));
      } else if (SCENE.scene.fog.near > SCENE.scene.fog.userData.nearTo) {
        SCENE.scene.fog.near -= dynamicUpdateAnimationSpeeds.fog.speed;
        SCENE.scene.fog.near = parseFloat(SCENE.scene.fog.near.toFixed(5));
      } else {
        SCENE.scene.fog.userData.nearTo = undefined;
      }
    }
    if (SCENE.scene.fog.userData.farTo) {
      if (SCENE.scene.fog.far < SCENE.scene.fog.userData.farTo) {
        SCENE.scene.fog.far += dynamicUpdateAnimationSpeeds.fog.speed;
        SCENE.scene.fog.far = parseFloat(SCENE.scene.fog.far.toFixed(5));
      } else if (SCENE.scene.fog.far > SCENE.scene.fog.userData.farTo) {
        SCENE.scene.fog.far -= dynamicUpdateAnimationSpeeds.fog.speed;
        SCENE.scene.fog.far = parseFloat(SCENE.scene.fog.far.toFixed(5));
      } else {
        SCENE.scene.fog.userData.farTo = undefined;
      }
    }
  }
}
function getNShapesWithTypes() {
  let a = Object.keys(extraShapes);
  let t = {};
  for (let e of a) {
    t[e] = 0;
  }
  for (let e of Axis) {
    if (e.enabled) {
      for (pivot of e.pivots) {
        if (!pivot.userData.disabled) {
          for (let e of a) {
            if (pivot.userData.shapeType == e) {
              if (t[e]) {
                t[e]++;
              } else {
                t[e] = 1;
              }
            }
          }
        }
      }
    }
  }
  return t;
}
function pickAxisForShape(a) {
  let t = [];
  for (let e = 0; e < Axis.length; e++) {
    if (Axis[e].enabled && extraShapes[a].axis.indexOf(e + 1) > -1) {
      t.push(e);
    }
  }
  if (t.length > 0) {
    return Axis[pick(t)];
  }
}
function pivotNotAnimating(e) {
  for (child of e.children) {
    if (child.userData.animationQueue && child.userData.animationQueue.length > 0) {
      return false;
    }
  }
  return e.userData.animationQueue && e.userData.animationQueue.length == 0;
}
function pivotIsAppearingOrDisappearing(e) {
  return Boolean(
    e.userData.shrinkDown || e.userData.growUp || e.userData.delayedDisappear || e.userData.delayedAppear
  );
}
function processUpdateTimers() {
  let a = getCurrentTs();
  for (let e = 0; e < Axis.length; e++) {
    ax = Axis[e];
    if (e == 5 || e == 6) {
      if (ax.enabled && ax.TS_ENABLED && a > ax.TS_ENABLED) {
        disableAxis(ax, dynamicUpdateAnimationSpeeds.axisAppearAndDisappear.speed);
        ax.TS_ENABLED = undefined;
        console.log("Normalized number of axis");
      }
    }
    if (ax.TS_ROTATED && a > ax.TS_ROTATED) {
      rotateAxis(
        ax.name,
        undefined,
        undefined,
        ax.originalAngle,
        dynamicUpdateAnimationSpeeds.axisAngle.speed,
        dynamicUpdateAnimationSpeeds.axisAngle.curve
      );
      ax.TS_ROTATED = undefined;
      console.log("Normalized axis rotation");
    }
    if (ax.TS_ROTATED_EXTREME && a > ax.TS_ROTATED_EXTREME) {
      rotateAxis(
        ax.name,
        undefined,
        undefined,
        ax.originalAngle,
        dynamicUpdateAnimationSpeeds.axisExtremeAngle.speed,
        dynamicUpdateAnimationSpeeds.axisExtremeAngle.curve
      );
      ax.TS_ROTATED_EXTREME = undefined;
      console.log("Normalized axis extreme rotation");
    }
    if (ax.TS_POSITION && a > ax.TS_POSITION) {
      moveAxis(
        ax.name,
        ax.originalPosition[0],
        ax.originalPosition[1],
        ax.originalPosition[2],
        dynamicUpdateAnimationSpeeds.axisPosition.speed,
        dynamicUpdateAnimationSpeeds.axisPosition.curve
      );
      ax.TS_POSITION = undefined;
      console.log("Normalized axis position");
    }
    if (ax.TS_NEGATIVESPACE && a > ax.TS_NEGATIVESPACE) {
      removeNegativeSpace(ax);
      ax.TS_NEGATIVESPACE = undefined;
      console.log("Normalized negative space");
    }
    if (ax.TS_NUMBEROFKNOTS && a > ax.TS_NUMBEROFKNOTS) {
      let e = 0;
      for (p of ax.pivots) {
        if (p.userData.shapeType == "knot") {
          e++;
        }
      }
      let a = e - ax.originalNumberOfKnots;
      if (a > 0) {
        disappearObjects(a, dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed, true, "E", "knot");
      }
      ax.TS_NUMBEROFKNOTS = undefined;
      console.log("Normalized number of knots");
    }
    for (let e of ax.pivots) {
      if (e.userData.TS_SPINNING && a > e.userData.TS_SPINNING) {
        removeRotationLoop(e.userData.name, ax.name, e.userData.spinningAxis);
        e.userData.TS_SPINNING = undefined;
        console.log("Normalized spinning obj");
      }
      if (e.userData.TS_KNOTSPQ && a > e.userData.TS_KNOTSPQ) {
        extraShapes.knot.p = extraShapes.knot.originalP;
        extraShapes.knot.q = extraShapes.knot.originalQ;
        disappearPivot(
          e,
          dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed,
          true,
          undefined,
          () => {
            addNewShape(
              ax.name,
              `knot_1`,
              "knot",
              dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed
            );
          }
        );
        e.userData.TS_KNOTSPQ = undefined;
        console.log("Normalized knot p q");
      }
      if (e.userData.TS_ROTATIONDIRECTION && a > e.userData.TS_ROTATIONDIRECTION) {
        switchObjectRotationDirection(
          e.userData.name,
          ax.name,
          dynamicUpdateAnimationSpeeds.axisRotationDirection.speed,
          dynamicUpdateAnimationSpeeds.axisRotationDirection.curve
        );
        e.userData.TS_ROTATIONDIRECTION = undefined;
        console.log("Normalized axis rotation");
      }
    }
    if (ax.TS_EXTRAOBJECTCLASS && a > ax.TS_EXTRAOBJECTCLASS) {
      for (pivot of ax.pivots) {
        if (pivot.userData.name.includes("update17")) {
          disappearPivot(pivot, dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed, true);
        }
      }
      ax.TS_EXTRAOBJECTCLASS = undefined;
      console.log("Normalized extra obj class");
    }
  }
  if (SCENE.camera.userData.TS_POSITION && a > SCENE.camera.userData.TS_POSITION) {
    updateCameraPosition(
      undefined,
      undefined,
      SCENE.camera.userData.originalPositionZ,
      dynamicUpdateAnimationSpeeds.cameraPosition.speed,
      dynamicUpdateAnimationSpeeds.cameraPosition.curve
    );
    SCENE.camera.userData.TS_POSITION = undefined;
    console.log("Normalized camera position");
  }
  if (SCENE.scene.fog.userData.TS_ENABLED && a > SCENE.scene.fog.userData.TS_ENABLED) {
    if (SCENE.scene.fog.userData.nearTo) {
      console.log("Fog is already animating");
    } else {
      SCENE.scene.fog.userData = { nearTo: 100, farTo: 100 };
      SCENE.scene.fog.enabled = false;
      debugUpdateLog += `Disabled fog\n`;
      SCENE.scene.fog.userData.TS_ENABLED = undefined;
      console.log("Normalized fog");
    }
  }
}
function updateScene() {
  try {
    processUpdateTimers();
  } catch (c) {
    console.error(c);
  }
  for (let a of Axis) {
    for (let e of a.pivots) {
      if (e.userData.toBeRemoved && !(e.userData.growUp || e.userData.shrinkDown)) {
        console.log(`Removed pivots: ${a.name} - ${e.userData.name}`);
        SCENE.scene.remove(e);
        e.userData.alreadyRemoved = true;
      }
    }
    a.pivots = a.pivots.filter((e) => !e.userData.alreadyRemoved);
  }
  let l = "";
  let e = getCurrentTs();
  for (let t of Axis) {
    if (t.enabled) {
      if (t.extremeAngleEnabledTimestamp) {
        if (e > t.extremeAngleEnabledTimestamp + durationOfTimeBasedUpdates * 60) {
          t.extremeAngle = undefined;
          t.axisAngle = t.originalAngle;
          let e = THREE.MathUtils.radToDeg(t.mainPivot.rotation.z);
          t.extremeAngleEnabledTimestamp = undefined;
          let a = randFromRange(t.axisAngle);
          rotateAxis(
            t.name,
            undefined,
            undefined,
            a,
            dynamicUpdateAnimationSpeeds.axisExtremeAngle.speed,
            dynamicUpdateAnimationSpeeds.axisExtremeAngle.curve
          );
          l += `Normalized ${t.name} extreme angle from ${e} to ${a}\n`;
        }
      }
      if (t.rotationDirectionSwitchTimestamp) {
        if (e > t.rotationDirectionSwitchTimestamp + durationOfTimeBasedUpdates * 60) {
          t.rotationDirectionSwitchTimestamp = undefined;
          for (let e of t.pivots) {
            switchObjectRotationDirection(
              e.userData.name,
              t.name,
              dynamicUpdateAnimationSpeeds.axisRotationDirection.speed,
              dynamicUpdateAnimationSpeeds.axisRotationDirection.curve
            );
          }
          l += `Normalized axis rotation direction ${t.name}\n`;
        }
      }
    }
  }
  if (SCENE.knotUpdateTimestamp) {
    if (e > SCENE.knotUpdateTimestamp + durationOfKnotUpdates * 60) {
      let a = 0;
      for (let e of Axis) {
        for (p of e.pivots) {
          if (p.userData.shapeType == "knot" && p.userData.name[0] == "E") {
            a++;
          }
        }
        if (a) {
          let e = disappearObjects(a, dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed, true, "E");
          console.log("Removed", e, "knots based on timestamp");
        }
      }
      SCENE.knotUpdateTimestamp = undefined;
    }
  }
  for (let e of Axis.slice(5, 7)) {
    if (!e.enabled) {
      for (let a of e.pivots) {
        if (
          !a.userData.animationQueue ||
          (a.userData.animationQueue && a.userData.animationQueue.length == 0)
        ) {
          for (let e of a.children) {
            e.visible = false;
          }
        }
      }
    }
  }
  if (l) {
    console.log(l);
  }
  var a = SCENE.data.contract.tiers.royalty_received_tier;
  var n = SCENE.data.contract.tiers.contract_activity_tier;
  var t = SCENE.data.contract.tiers.sends_tier;
  var i = SCENE.data.contract.tiers.approvals_tier;
  console.log(`Tiers: royalty: ${a.value} contract: ${n.value} sends: ${t.value} approvals: ${i.value}`);
  l = "";
  let r = shuffle([1, 2, 3, 4, 8, 9, 10, 11, 14, 15, 16, 17]);
  let o = [];
  if (SCENE.data.wallets) {
    o.push(r.pop());
  }
  if (a.changed) {
    console.log("royalty_received_tier triggered");
    o.push(5);
  }
  if (n.changed) {
    console.log("contract_activity_tier triggered");
    o.push(13);
  }
  if (t.changed) {
    console.log("sends_tier triggered");
    o.push(6);
  }
  if (i.changed) {
    console.log("approvals_tier triggered");
    o.push(7);
  }
  if (o.length == 0) {
    o.push(0);
  }
  if (DEBUG_UPDATE_SOURCE == "random") {
    o = [rand(0, 17, 1)];
  }
  if (DEBUG_UPDATE_SOURCE != undefined && DEBUG_UPDATE_SOURCE != "random") {
    o = Array.isArray(DEBUG_UPDATE_SOURCE) ? DEBUG_UPDATE_SOURCE : [DEBUG_UPDATE_SOURCE];
  }
  console.log("updateType", o);
  if (o.indexOf(0) != -1) {
    let t = 0;
    let i = 0;
    for (let a of Axis) {
      for (let e of a.pivots) {
        if (e.userData.disabled) {
          i++;
        } else {
          t++;
        }
      }
    }
    let e = 0;
    let a = 0;
    if (i == 0) {
      a = rand(0, 10, 1);
    } else if (t / i < 3) {
      e = rand(10, 20, 1);
      a = 0;
    } else {
      e = rand(0, 10, 1);
      a = e * rand(0, 0.5, 0.1);
    }
    e = rand(10, 20, 1);
    a = rand(1, 10, 1);
    console.log("nObjectsToAppear", e, "nObjectsToDisappear", a);
    let n = appearObjects(e, dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed);
    let r = disappearObjects(a, dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed);
    l += `Appeared objects:${n} Dissapeared objects:${r} (${t},${i})\n`;
  }
  if (o.indexOf(1) != -1) {
    let e = Axis[pick([5, 6])];
    if (e.enabled) {
      disableAxis(e, dynamicUpdateAnimationSpeeds.axisAppearAndDisappear.speed);
      l += `Disabled axis:${e.name}\n`;
    } else {
      enableAxis(e, dynamicUpdateAnimationSpeeds.axisAppearAndDisappear.speed);
      l += `Enabled axis:${e.name}\n`;
      e.TS_ENABLED = getCurrentTs() + addOrRemoveAxisUpdateTimeout;
    }
  }
  if (o.indexOf(2) != -1) {
    let e = pickAxis(true, [], true);
    if (e == undefined) {
      console.log("No axis for angle change found");
      return;
    }
    let a = randFromRange(hashOverwrites.axisAngle);
    let t = THREE.MathUtils.radToDeg(e.mainPivot.rotation.z);
    if (!e.originalAngle) {
      e.originalAngle = t;
    }
    rotateAxis(
      e.name,
      undefined,
      undefined,
      a,
      dynamicUpdateAnimationSpeeds.axisAngle.speed,
      dynamicUpdateAnimationSpeeds.axisAngle.curve
    );
    l += `Changed ${e.name} angle from ${t} to ${a}\n`;
    e.TS_ROTATED = getCurrentTs() + axisAngleUpdateTimeout;
  }
  if (o.indexOf(3) != -1) {
    let e = pickAxis(true, [], true);
    if (e == undefined) {
      console.log("No axis for extreme angle change found");
      return;
    }
    let a = THREE.MathUtils.radToDeg(e.centralRodRotation[2]);
    let t = rand(0, 1, 0.001) > 0.5 ? rand(-90, -30, 1) : rand(30, 90, 1);
    if (e.originalAngle == undefined) {
      e.originalAngle = e.axisAngle;
    }
    e.extremeAngle = t;
    e.axisAngle = [t, t, 1];
    e.extremeAngleEnabledTimestamp = getCurrentTs();
    rotateAxis(
      e.name,
      undefined,
      undefined,
      t,
      dynamicUpdateAnimationSpeeds.axisExtremeAngle.speed,
      dynamicUpdateAnimationSpeeds.axisExtremeAngle.curve
    );
    l += `Changed ${e.name} extreme angle from ${a} to ${t}\n`;
    e.TS_ROTATED_EXTREME = getCurrentTs() + axisExtremeAngleUpdateTimeout;
  }
  if (o.indexOf(4) != -1) {
    let e = pickAxis(true, [], false);
    let a = `${e.centraRodPosition[0]} ${e.centraRodPosition[1]} ${e.centraRodPosition[2]}`;
    if (!e.originalPosition) {
      e.originalPosition = JSON.parse(JSON.stringify(e.centraRodPosition));
    }
    let t = undefined;
    let i = undefined;
    let n = undefined;
    let r = rand(0, 2, 1);
    if (r == 0) {
      t = randFromRange(hashOverwrites.axisX);
    } else if (r == 1) {
      i = randFromRange(hashOverwrites.axisY);
    } else {
      n = randFromRange(hashOverwrites.axisZ);
    }
    let o = `${t / 20} ${i / 20} ${n / 20}`;
    moveAxis(
      e.name,
      t,
      i,
      n,
      dynamicUpdateAnimationSpeeds.axisPosition.speed,
      dynamicUpdateAnimationSpeeds.axisPosition.curve
    );
    l += `Changed ${e.name} position from ${a} to ${o}\n`;
    e.TS_POSITION = getCurrentTs() + axisPositionUpdateTimeout;
  }
  if (o.indexOf(5) != -1) {
    let t = tierToValue(tiersStructure.royalty, a.value);
    let i = pickAxis(true, [], false);
    for (let a of i.pivots) {
      let e = a.userData.originalRotationSpeed * t;
      updateObjectRotationSpeed(
        a.userData.name,
        i.name,
        e,
        dynamicUpdateAnimationSpeeds.objectRotationSpeed.speed,
        dynamicUpdateAnimationSpeeds.objectRotationSpeed.curve
      );
      l += `Changed ${i.name} ${a.userData.name} rotation speed from ${a.userData.originalRotationSpeed} to ${e}\n`;
    }
  }
  if (o.indexOf(6) != -1) {
    let i = tierToValue(tiersStructure.sends, t.value);
    for (ax of Axis) {
      if (ax.enabled) {
        for (let t of ax.pivots) {
          let e = t.userData.originalPosition[0];
          let a = e * i;
          updateObjectDistanceFromAxis(
            t.userData.name,
            ax.name,
            a,
            dynamicUpdateAnimationSpeeds.objectPosition.speed,
            dynamicUpdateAnimationSpeeds.objectPosition.curve
          );
          l += `Changed ${ax.name} ${t.userData.name} distance from axis from ${e} to ${a}\n`;
        }
      }
    }
  }
  if (o.indexOf(7) != -1) {
    let e = tierToValue(tiersStructure.approvals, i.value);
    if (!SCENE.worldPlane.userData.originalScaleX) {
      SCENE.worldPlane.userData.originalScaleX = SCENE.worldPlane.scale.x;
    }
    let a = SCENE.worldPlane.userData.originalScaleX * e;
    updateBackgroundGradientScale(
      a,
      dynamicUpdateAnimationSpeeds.gradientScale.speed,
      dynamicUpdateAnimationSpeeds.gradientScale.curve
    );
    l += `Changed gradient scale from ${SCENE.worldPlane.scale.x} to ${a}\n`;
  }
  if (o.indexOf(8) != -1) {
    let r = getLoopingObjects().length;
    let a = getNotLoopingObjects();
    shuffle(a);
    console.log(a);
    let o = randFromRange(spinningObjectsRange);
    l += `N spinning objects: ${r} Desired N spinning objects: ${o}\n`;
    let s = false;
    for (let e = 0; e < 500; e++) {
      for (let n of a) {
        let e = n[0];
        let a = n[1];
        if (a.userData.name.includes("terrain")) {
          continue;
        }
        let t = randFromRange(dynamicUpdateAnimationSpeeds.objectRotationSpeed2.speed);
        let i = "Y";
        if (a.userData.name.includes("cone")) {
          i = "Z";
          t *= conesSpinningSpeedMultiplier;
        } else if (a.userData.name.includes("knot")) {
          t *= knotsSpinningSpeedMultiplier;
        }
        if (
          a.children[0].userData.animationLoop == undefined ||
          a.children[0].userData.animationLoop.length == 0
        ) {
          addRotationLoop(a.userData.name, e, i, t);
          l += `Adding rotation loop to ${e} ${a.userData.name} speed: ${t}\n`;
          a.userData.spinningAxis = i;
          a.userData.TS_SPINNING = getCurrentTs() + objectSpinningUpdateTimeout;
          r++;
          if (r >= o) {
            s = true;
            break;
          }
          break;
        }
      }
      if (s) {
        break;
      }
    }
  }
  if (o.indexOf(9) != -1) {
    if (SCENE.camera.userData.animationQueue && SCENE.camera.userData.animationQueue.length > 0) {
      console.log("Camera is already animating", SCENE.camera.userData.animationQueue);
    } else {
      if (!SCENE.camera.userData.originalPositionZ) {
        SCENE.camera.userData.originalPositionZ = SCENE.camera.position.z;
      }
      SCENE.camera.userData.positionUpdateTimestamp = getCurrentTs();
      let e = rand(30, cameraZ - 5, 1);
      if (rand(0, 1, 0.01) > 0.5) {
        e = rand(cameraZ + 5, 150, 1);
      }
      updateCameraPosition(
        undefined,
        undefined,
        e,
        dynamicUpdateAnimationSpeeds.cameraPosition.speed,
        dynamicUpdateAnimationSpeeds.cameraPosition.curve
      );
      l += `Changed camera position to ${e}\n`;
      SCENE.camera.userData.TS_POSITION = getCurrentTs() + cameraPositionUpdateTimeout;
    }
  }
  if (o.indexOf(10) != -1) {
    if (!SCENE.scene.fog.enabled) {
      if (SCENE.scene.fog.userData.nearTo) {
        console.log("Fog is already animating");
      } else {
        SCENE.scene.fog.userData = { nearTo: fogNear, farTo: fogFar };
        SCENE.scene.fog.enabled = true;
        l += `Enabled fog\n`;
        SCENE.scene.fog.userData.TS_ENABLED = getCurrentTs() + fogUpdateTimeout;
      }
    } else {
      if (SCENE.scene.fog.userData.nearTo) {
        console.log("Fog is already animating");
      } else {
        SCENE.scene.fog.userData = { nearTo: 100, farTo: 100 };
        SCENE.scene.fog.enabled = false;
        l += `Disabled fog\n`;
      }
    }
  }
  if (o.indexOf(11) != -1) {
    let a = pickAxis(true, [], false);
    for (let e of a.pivots) {
      a.rotationDirectionSwitchTimestamp = getCurrentTs();
      switchObjectRotationDirection(
        e.userData.name,
        a.name,
        dynamicUpdateAnimationSpeeds.axisRotationDirection.speed,
        dynamicUpdateAnimationSpeeds.axisRotationDirection.curve
      );
      e.userData.TS_ROTATIONDIRECTION = getCurrentTs() + axisRotationDirectionUpdateTimeout;
    }
    l += `Changed axis rotation direction ${a.name} \n`;
  }
  if (o.indexOf(13) != -1) {
    let t = 0;
    for (let e of Axis) {
      if (e.enabled) {
        t += e.pivots.map((e) => !e.userData.disabled).length;
      }
    }
    let i = getNShapesWithTypes();
    console.log("nShapesByType:", i);
    if (!SCENE.originalNumberOfShapes) {
      SCENE.originalNumberOfShapes = t;
      SCENE.originalNumberOfShapesByType = i;
    }
    let e = tierToValue(tiersStructure.contract, n.value);
    for (let a of Object.keys(SCENE.originalNumberOfShapesByType)) {
      if (a == "terrain" || a == "clouds" || a == "knot") {
        continue;
      }
      if (SCENE.originalNumberOfShapesByType[a]) {
        var s = SCENE.originalNumberOfShapesByType[a] * e;
      } else {
        var s = i[a] * e;
      }
      if (i[a] != s) {
        l += `${a} current: ${i[a]} desired: ${s}\n`;
      }
      if (t < 300 && s > i[a]) {
        for (let e = 0; e < s - i[a]; e++) {
          let e = pickAxisForShape(a);
          if (!e) {
            console.warn("No axis picked for", a);
            continue;
          }
          setTimeout(() => {
            addNewShape(
              e.name,
              `E_${a}_${generateUUID()}`,
              a,
              dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed
            );
            l += `Added shape ${a} to ${e.name} \n`;
          }, randFromRange(addOrRemoveObjectsTieredTimeSpreadRange));
        }
      } else if (t > 20 && s < i[a]) {
        let e = disappearObjects(
          Math.abs(i[a] - s),
          dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed,
          true,
          undefined,
          a,
          addOrRemoveObjectsTieredTimeSpreadRange
        );
        l += `Removed ${e}\n`;
      } else {
        console.debug("Can't add or remove shapes");
      }
    }
  }
  if (o.indexOf(17) != -1) {
    let t = {};
    let i = [];
    for (let a of Axis) {
      if (a.enabled) {
        for (let e of a.pivots) {
          if (t[e.userData.shapeType]) {
            t[e.userData.shapeType]++;
          } else {
            t[e.userData.shapeType] = 1;
          }
          if (e.userData.name.includes("update17") && i.indexOf(e.userData.shapeType) == -1) {
            i.push(e.userData.shapeType);
          }
        }
      }
    }
    if (!SCENE.originalNumberOfShapeTypes) {
      SCENE.originalNumberOfShapeTypes = sizeOfMapping(t);
    }
    let e = pick([0, 1]);
    if ((e == 1 && i.length <= 2) || i.length == 0) {
      for (let i of shuffle(Object.keys(extraShapes))) {
        if (!t[i]) {
          let a = pickAxis(true, [], false);
          let t = extraShapes[i].numberOfShapes;
          console.log("Adding", t, i, "to", a.name);
          for (let e = 0; e < t; e++) {
            addNewShape(
              a.name,
              `E_${i}_update17_${generateUUID()}`,
              i,
              dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed
            );
            a.TS_EXTRAOBJECTCLASS = getCurrentTs() + objectClassUpdateTimeout;
          }
          break;
        }
      }
    } else if (e == 0 && i.length > 0) {
      let e = pick(i);
      console.log("Removing existing shape type", e);
      let a = disappearObjectsByType(
        undefined,
        dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed,
        true,
        undefined,
        e
      );
      console.log("nDisappeared", a);
    }
  }
  if (o.indexOf(14) != -1) {
    let a = pick(["triangle", "diamond"]);
    let t = randFromRange(nObjectsLeftOutsideOfNegativeSpace);
    let i = pick(diamondNegativeSpaceAngles);
    for (let e of Axis) {
      if (e.clipPlanes == undefined || e.clipPlanes.length == 0) {
        createNegativeSpace(e, a, true, t, i);
        l += `Added ${a} negative space to ${e.name}\n`;
        e.TS_NEGATIVESPACE = getCurrentTs() + negativeSpaceUpdateTimeout;
      } else {
        if (e.removingNegativeSpace || e.creatingNegativeSpace) {
          console.log(`Negative space for ${e.name} already being animated.`);
        } else {
          removeNegativeSpace(e);
          l += `Removed negative space from ${e.name}\n`;
        }
      }
    }
  }
  if (o.indexOf(15) != -1) {
    let e = rand(5, 40, 1);
    let a = 0;
    for (ax of Axis) {
      let e = 0;
      for (p of ax.pivots) {
        if (p.userData.shapeType == "knot") {
          e++;
        }
      }
      a += e;
      if (!ax.originalNumberOfKnots) {
        ax.originalNumberOfKnots = e;
      }
    }
    console.log(`Number of knots ${a} desired number of knots ${e}`);
    let i = e - a;
    if (i == 0) {
      console.log("Nothing to do");
    } else {
      if (i > 0) {
        for (let t = 0; t < Math.abs(i); t++) {
          let e = pick(extraShapes["knot"].axis);
          let a = Axis[e - 1];
          addNewShape(
            a.name,
            `E_knot_${t}`,
            "knot",
            dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed
          );
          if (!SCENE.knotUpdateTimestamp) {
            SCENE.knotUpdateTimestamp = getCurrentTs();
          }
          a.TS_NUMBEROFKNOTS = getCurrentTs() + numberOfKnotsUpdateTimeout;
          l += `Added knot to ${a.name}\n`;
        }
      } else {
        disappearObjects(
          Math.abs(i),
          dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed,
          true,
          "E",
          "knot"
        );
        l += `Removed knots\n`;
      }
    }
  }
  if (o.indexOf(16) != -1) {
    if (extraShapes.knot.originalP == undefined) {
      extraShapes.knot.originalP = extraShapes.knot.p;
    }
    extraShapes.knot.p = knotsDynamicPRange;
    if (extraShapes.knot.originalQ == undefined) {
      extraShapes.knot.originalQ = extraShapes.knot.q;
    }
    extraShapes.knot.q = knotsDynamicQRange;
    for (let a of Axis) {
      if (!a.addingKnots) {
        for (let e of a.pivots) {
          if (e.userData.name.includes("knot") && e.userData.name[0] != "E") {
            if (!pivotIsAppearingOrDisappearing(e)) {
              l += `Changing q and p of ${a.name} ${e.userData.name}\n`;
              a.addingKnots = true;
              disappearPivot(
                e,
                dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed,
                true,
                undefined,
                () => {
                  addNewShape(
                    a.name,
                    `knot_${generateUUID()}`,
                    "knot",
                    dynamicUpdateAnimationSpeeds.objectAppearAndDisappear.speed
                  );
                }
              );
              e.userData.TS_KNOTSPQ = getCurrentTs() + knotsPQUpdateTimeout;
              setTimeout(() => {
                a.addingKnots = false;
              }, 6e4);
            }
          }
        }
      }
    }
  }
  console.log(l);
}
function getPivotsWithSmallShapes(i) {
  for (let t of Axis) {
    if (t.enabled) {
      for (let a = 0; a < t.pivots.length; a++) {
        let e = t.pivots[a];
        if (e.children[0].scale.x < i && e.children[0].scale.x != 0) {
          console.log(t.name, a, e.userData.name);
        }
      }
    }
  }
}
function processShrinkAndGrow(t) {
  if (t.userData.shrinkDown) {
    if (t.userData.shrinkDown < 1e-6) {
      t.userData.shrinkDown = 1e-6;
    }
    if (t.userData.shrinkDown > 0.1) {
      t.userData.shrinkDown = 0.1;
    }
    let a = true;
    for (let e of ["x", "y", "z"]) {
      if (t.children[0].scale[e] > 0) {
        t.children[0].scale[e] -= t.userData.shrinkDown;
        a = false;
      } else {
        t.children[0].scale[e] = 0;
        t.userData.toBeRemoved = t.userData.toBeRemovedAfterShrink;
      }
    }
    if (a) {
      t.userData.shrinkDown = undefined;
      t.visible = false;
      if (t.userData.disappearCallback) {
        t.userData.disappearCallback();
      }
    }
  }
  if (t.userData.growUp) {
    if (t.userData.growUp < 1e-6) {
      t.userData.growUp = 1e-6;
    }
    if (t.userData.growUp > 0.1) {
      t.userData.growUp = 0.1;
    }
    let a = true;
    t.visible = true;
    for (let e of ["x", "y", "z"]) {
      if (t.children[0].scale[e] < t.children[0].userData.originalScale[e]) {
        t.children[0].scale[e] += t.userData.growUp;
        a = false;
      } else {
        t.children[0].scale[e] = t.children[0].userData.originalScale[e];
      }
    }
    if (a) {
      t.userData.growUp = undefined;
    }
  }
}
async function getThreeJS() {
  for (let a = 0; a < NODE_PROVIDER_URLS.length; a++) {
    try {
      var t = await fetch(NODE_PROVIDER_URLS[a], {
        method: "POST",
        body: JSON.stringify({
          method: "eth_call",
          params: [
            {
              to: "0x16cc845d144A283D1b0687FBAC8B0601cC47A6C3",
              data: "0x43920d7d0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001074687265652e6a7320302e3134342e3000000000000000000000000000000000",
            },
            "latest",
          ],
          id: 2,
          jsonrpc: "2.0",
        }),
      });
      let e = await t.json();
      return hexToString(e.result);
    } catch (e) {
      console.log("Node failed.", NODE_PROVIDER_URLS[a]);
    }
  }
}
function hexToString(a) {
  if (a.startsWith("0x")) {
    a = a.slice(2);
  }
  let t = "";
  for (let e = 0; e < a.length; e += 2) {
    const i = parseInt(a.substr(e, 2), 16);
    t += String.fromCharCode(i);
  }
  return t;
}
async function dataUpdate() {
  SCENE.data.contractPrev = SCENE.data.contract;
  SCENE.data.contract = await getContractData();
  if (LIVE_MODE) {
    SCENE.data.wallets = await walletActivityUpdates(SCENE.data.contract[SCENE.data.contract.length - 1]);
  } else {
    SCENE.data.wallets = await walletActivityUpdates("ANYWALLET");
  }
  SCENE.data.contract.tiers = SCENE.data.contractPrev.tiers;
  calculateTiers(SCENE.data.contract);
  calculateContractDataUpdates();
  console.debug("Tiers:", SCENE.data.contract.tiers);
  console.debug("Data updates:", [
    SCENE.data.contractUpdates.approvalCount,
    SCENE.data.contractUpdates.transferCount,
    SCENE.data.contractUpdates.holderCount,
    SCENE.data.contractUpdates.royalty,
  ]);
  if (!LIVE_MODE) {
    SCENE.data.contract = randomContractData();
    calculateContractDataUpdates();
    SCENE.data.contract.tiers = {
      royalty_received_tier: { changed: pick([true, false]), value: rand(-3, 3, 1) },
      contract_activity_tier: { changed: pick([true, false]), value: rand(-3, 3, 1) },
      sends_tier: { changed: pick([true, false]), value: rand(-3, 3, 1) },
      approvals_tier: { changed: pick([true, false]), value: rand(-3, 3, 1) },
    };
    console.debug("Random Tiers:", SCENE.data.contract.tiers);
    console.debug("Random data updates:", [
      SCENE.data.contractUpdates.approvalCount,
      SCENE.data.contractUpdates.transferCount,
      SCENE.data.contractUpdates.holderCount,
      SCENE.data.contractUpdates.royalty,
    ]);
  }
}
function init() {
  SCENE = { data: { wallet: {}, contract: {} }, specialObjects: {}, updateStartTimesAndValues: {} };
  if (tokenHash) {
    populatePalette();
    populateAbstractMaterials();
    populateAxisExtraShapes();
    overwriteAxis();
    logDebugMessage();
  }
  SCENE.camera = makeCamera();
  SCENE.scene = makeScene();
  SCENE.renderer = makeRenderer();
  for (let n of Axis) {
    n.mainPivot = new THREE.Object3D();
    n.mainPivot.name = n.name;
    var t = [];
    for (let e in n.coneTypes) {
      n.coneTypes[e][e] = true;
      t.push(n.coneTypes[e]);
    }
    shuffle(t);
    n.axisArrayConeTypes = t;
    if (n.enableNegativeSpace) {
      createNegativeSpace(n, undefined, true);
    }
    n.pivots = [];
    let i = n.growShapes.onStartup ? n.growShapes.speed : undefined;
    for (let t in n.extraShapes) {
      let a = n.extraShapes[t];
      for (let e = 0; e < a.numberOfShapes; e++) {
        if (a.cone) {
          addConeToAxis(n, `cone${e}`, a, i, t);
        } else {
          addExtraShapeToAxis(n, `${t}${e}`, t, a, i);
        }
      }
    }
    let e = meanPositionOfPivots(n.pivots);
    let a = meanRotationOfPivots(n.pivots);
    n.centraRodPosition = e;
    n.centralRodRotation = a;
    if (n.addCentralRod) {
      n.rodMaterial = new THREE.MeshBasicMaterial({
        color: n.centralRodColor,
        side: THREE.FrontSide,
        wireframe: false,
      });
      const s = new THREE.BoxGeometry(n.centralRodWidth, n.centralRodLength, n.centralRodWidth);
      n.rod = new THREE.Mesh(s, n.rodMaterial);
      n.rod.position.set(e[0], e[1], e[2]);
      n.rod.rotation.z = a[2];
      n.mainPivot.add(n.rod);
    }
    SCENE.scene.add(n.mainPivot);
    if (!n.enabled) {
      setAxisInvisibleAndDisabled(n);
    }
  }
  for (let e of Lights) {
    makeLight(e);
    SCENE.scene.add(e.light);
  }
  if (enableWorldGradient) {
    makeWorldPlane();
  }
  SCENE.renderer.render(SCENE.scene, SCENE.camera);
  if (enableShadows) {
    SCENE.renderer.shadowMap.enabled = true;
    SCENE.renderer.shadowMap.type = THREE.PCFShadowMap;
  }
  let i = new THREE.Clock();
  let n = 0;
  let r = 1 / animationFPS;
  SCENE.cameraMovementSpeed = { x: 0, y: 0, z: 0 };
  const o = (e) => {
    requestAnimationFrame(o);
    n += i.getDelta();
    animateFog();
    for (let t of Axis) {
      if (t.mainPivot.userData.animationQueue && t.mainPivot.userData.animationQueue.length > 0) {
        processAnimationQueue(t.mainPivot);
      }
      for (let a of t.pivots) {
        processShrinkAndGrow(a);
        a.rotateY(THREE.MathUtils.degToRad(a.userData.rotationSpeed * n));
        if (a.userData.animationQueue && a.userData.animationQueue.length > 0) {
          processAnimationQueue(a);
        }
        if (a.userData.animationLoop) {
          processAnimationLoop(a);
        }
        for (let e of a.children) {
          if (e.userData.animationQueue && e.userData.animationQueue.length > 0) {
            processAnimationQueue(e);
          }
          if (e.userData.animationLoop) {
            processAnimationLoop(e);
          }
        }
      }
      if (t.enableNegativeSpaceAnimation) {
        animateAxisNegativeSpace(t, n);
      }
      try {
        if (t.clipPlanes) {
          for (let e of t.clipPlanes) {
            if (e.userData) {
              if (e.userData.desiredConstant > e.constant) {
                e.constant += negativeSpaceAnimationSpeed;
              } else if (e.userData.desiredConstant < e.constant) {
                e.constant -= negativeSpaceAnimationSpeed;
              }
            }
          }
        }
      } catch (a) {
        console.error("Animating negative space failed");
      }
    }
    if (SCENE.worldPlane.userData.animationQueue && SCENE.worldPlane.userData.animationQueue.length > 0) {
      processAnimationQueue(SCENE.worldPlane);
    }
    if (SCENE.camera.userData.animationQueue && SCENE.camera.userData.animationQueue.length > 0) {
      processAnimationQueue(SCENE.camera);
    }
    if (enableWorldGradientAnimation) {
      animateWorldPlane();
    }
    if (enableFog) {
      processAnimationQueue(SCENE.scene.fog);
    }
    if (SCENE.cameraMovementSpeed.y != 0) {
      SCENE.camera.position.y += SCENE.cameraMovementSpeed.y;
      SCENE.cameraMovementSpeed.y *= 0.98;
    }
    if (SCENE.cameraMovementSpeed.x != 0) {
      SCENE.camera.position.x += SCENE.cameraMovementSpeed.x;
      SCENE.cameraMovementSpeed.x *= 0.98;
    }
    if (SCENE.cameraMovementSpeed.z != 0) {
      SCENE.camera.position.z += SCENE.cameraMovementSpeed.z;
      SCENE.cameraMovementSpeed.z *= 0.98;
    }
    SCENE.renderer.render(SCENE.scene, SCENE.camera);
    n = n % r;
  };
  requestAnimationFrame(o);
  function e() {
    let e = window.innerWidth / window.innerHeight;
    SCENE.camera.aspect = e;
    SCENE.renderer.setSize(window.innerWidth, window.innerHeight);
    SCENE.camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", e, false);
  e();
  document.addEventListener("keydown", function (e) {
    if (e.key === "o") {
      if (SCENE.camera.zoom > 0.6) {
        SCENE.camera.zoom -= 0.003;
        SCENE.camera.updateProjectionMatrix();
      }
    }
    if (e.key === "i") {
      if (SCENE.camera.zoom < 2.5) {
        SCENE.camera.zoom += 0.003;
        SCENE.camera.updateProjectionMatrix();
      }
    }
  });
}
if (LIVE_MODE) {
  getThreeJS().then((t) => {
    eval(t.slice(156, t.length - 22));
    initImprovedNoise();
    initOBJLoader();
    init();
    dataUpdate();
    setInterval(dataUpdate, 12e3);
    setInterval(updateScene, 12e3);
  });
} else {
  initImprovedNoise();
  initOBJLoader();
  init();
  dataUpdate();
  setInterval(dataUpdate, 12e3);
  setInterval(updateScene, 12e3);
}
window.onkeydown = function (e) {
  if (e.keyCode === 77) {
    document
      .querySelector("body")
      .insertAdjacentHTML(
        "afterend",
        `<div id="prompt-container" class="prompt-container"><p>Change node URL:</p><input id="prompt" class="prompt" value="${NODE_PROVIDER_URLS[0]}"/></div>`
      );
  } else if (e.keyCode === 13) {
    p = document.getElementById("prompt");
    if (NODE_PROVIDER_URLS.indexOf(p.value) == -1) {
      NODE_PROVIDER_URLS = [p.value].concat(NODE_PROVIDER_URLS);
    }
    console.log(NODE_PROVIDER_URLS);
    pc = document.getElementById("prompt-container");
    pc.remove();
  } else if (e.keyCode === 27) {
    pc = document.getElementById("prompt-container");
    pc.remove();
  }
};
function hashString(a) {
  let t = 5381;
  for (let e = 0; e < a.length; e++) {
    t = (t * 33) ^ a.charCodeAt(e);
  }
  return t >>> 0;
}
function rand(a, t, e = 0.001) {
  if (a == t) {
    return a;
  }
  if (a > t) {
    let e = a;
    a = t;
    t = e;
  }
  const i = randomNumberGenerator.random();
  const n = (t - a) / e + e;
  const r = Math.floor(i * n) * e;
  return a + r;
}
function randS(a, t, e = 0.001) {
  if (a == t) {
    return a;
  }
  if (a > t) {
    let e = a;
    a = t;
    t = e;
  }
  const i = randomNumberGeneratorSeeded.random();
  const n = (t - a) / e + e;
  const r = Math.floor(i * n) * e;
  return a + r;
}
function randFromRange(e) {
  return rand(e[0], e[1], e[2]);
}
function randFromRangeS(e) {
  let a = randS(e[0], e[1], e[2]);
  return [a, a, 1];
}
function randFromRangeS2(e) {
  return randS(e[0], e[1], e[2]);
}
function shuffle(a) {
  for (let e = a.length - 1; e > 0; e--) {
    const t = Math.floor(randomNumberGenerator.random() * (e + 1));
    [a[e], a[t]] = [a[t], a[e]];
  }
  return a;
}
function shuffleS(a) {
  for (let e = a.length - 1; e > 0; e--) {
    const t = Math.floor(randS(0, 1, 0.01) * e);
    [a[e], a[t]] = [a[t], a[e]];
  }
  return a;
}
function pick(e) {
  return e[rand(0, e.length - 1, 1)];
}
function pickS(e) {
  return e[randS(0, e.length - 1, 1)];
}
function pickS2(e) {
  let a = JSON.parse(JSON.stringify(e));
  shuffleS(a);
  if (a.length == 1) {
    let e = a.pop();
    return [e, e];
  }
  v1 = a.pop();
  v2 = a.pop();
  v3 = v2;
  while (v1 == v2) {
    if (a.length == 0) {
      v2 = v3;
      break;
    }
    v2 = a.pop();
  }
  return [v1, v2];
}
function numberOfShapesMinMax(e) {
  return Array.isArray(e) ? randFromRangeS(e)[0] : e;
}
function pickFromProbabilityArrayS(e) {
  let a = JSON.parse(JSON.stringify(e));
  shuffleS(a);
  let t = 0;
  let i = -1;
  let n = null;
  let r = randS(0, 1, 0.01);
  for (let e = 0; e < a.length; e++) {
    t += a[e][0];
    if (r < t) {
      return a[e][1];
    } else if (a[e][0] > i) {
      i = a[e][0];
      n = a[e];
    }
  }
  return n[1];
}
function pickFromProbabilityMapS(e) {
  let a = JSON.parse(JSON.stringify(e));
  shuffleS(a);
  let t = 0;
  let i = -1;
  let n = null;
  let r = randS(0, 1, 0.01);
  for (let e = 0; e < a.length; e++) {
    t += a[e].probability;
    if (r < t) {
      return a[e];
    } else if (a[e].probability > i) {
      i = a[e].probability;
      n = a[e];
    }
  }
  return n;
}
function smallerRange(e, a) {
  e = randFromRangeS(e);
  return [e[0] - a, e[0] + a, e[2]];
}
function overwriteAxis() {
  let e = randFromRangeS(hashOverwrites.axisAngle)[0];
  let a = randFromRangeS(hashOverwrites.axisAngle)[0];
  let i = shuffleS([
    [e - 2, e + 2, 1],
    [e - 2, e + 2, 1],
    [e - 2, e + 2, 1],
    [a - 2, a + 2, 1],
    [a - 2, a + 2, 1],
    [a - 2, a + 2, 1],
    [a - 2, a + 2, 1],
  ]);
  for (let t = 0; t < Axis.length; t++) {
    let e = Axis[t];
    let a = i.pop();
    e.name = `axis${t + 1}`;
    e.axisAngle = a;
    e.originalAxisAngle = a;
    e.axisExtremeAngle = undefined;
    e.extremeAngleEnabledTimestamp = undefined;
    e.axisX = smallerRange(hashOverwrites.axisX, 5);
    e.axisY = smallerRange(hashOverwrites.axisY, 5);
    e.axisZ = smallerRange(hashOverwrites.axisZ, 5);
  }
}
function populatePalette() {
  if (traitsPalette) {
    SCENE.palette = palettes[traitsPalette[0]];
  } else {
    palettes = shuffleS(palettes);
    SCENE.palette = pickFromProbabilityMapS(palettes);
  }
  worldGradientColors = [
    [SCENE.palette.gradient[2], SCENE.palette.gradient[0]],
    [SCENE.palette.gradient[3], SCENE.palette.gradient[1]],
  ];
  fogColor = pickS(
    SCENE.palette.colors.filter((e) => {
      return e != SCENE.palette.gradient[0] && e != SCENE.palette.gradient[1];
    })
  );
  console.log(fogColor);
}
function populateAxisExtraShapes() {
  let a = Object.keys(materialTemplates);
  let t = -1;
  for (shapeType in extraShapes) {
    t++;
    shapeParams = extraShapes[shapeType];
    shapeParams.originalNumberOfShapes = shapeParams.numberOfShapes;
    shapeParams.numberOfShapes = randS(
      shapeParams.numberOfShapes[0],
      shapeParams.numberOfShapes[1] || shapeParams.numberOfShapes[0],
      1
    );
    shapeParams.material = pickFromProbabilityArrayS(shapeParams.material);
    if (traitsObjects) {
      for (let e = 0; e < traitsObjects.length; e += 3) {
        if (traitsObjects[e] == t) {
          shapeParams.axisToBeAddedTo = [pick(shapeParams.axis)];
          shapeParams.material = a[traitsObjects[e + 1]];
        }
      }
    } else {
      for (let e = 0; e < Axis.length; e++) {
        shapeParams.axisToBeAddedTo = [pick(shapeParams.axis)];
      }
    }
    if (shapeParams.extraAxis && shapeParams.extraAxis.length > 0) {
      if (!shapeParams.axisToBeAddedTo) {
        shapeParams.axisToBeAddedTo = [pick(shapeParams.extraAxis)];
      } else {
        shapeParams.axisToBeAddedTo.push(pick(shapeParams.extraAxis));
      }
    }
    if (shapeParams.secondColor) {
      let e = pickS(SCENE.palette.colors);
      if (Array.isArray(e)) {
        e = e[0];
      }
      shapeParams.secondColor = e;
    }
  }
  for (shapeType in extraShapes) {
    if (shapeType == "knot") {
      shapeParams = extraShapes[shapeType];
      if (Array.isArray(shapeParams.material)) {
        shapeParams.material = pickFromProbabilityArrayS(shapeParams.material);
      }
    }
  }
  for (let e = 0; e < Axis.length; e++) {
    Axis[e].extraShapes = {};
    for (shapeType in extraShapes) {
      shapeParams = JSON.parse(JSON.stringify(extraShapes[shapeType]));
      if (shapeParams.axisToBeAddedTo && shapeParams.axisToBeAddedTo.indexOf(e + 1) > -1) {
        if (!traitsObjects && randS(0, 1, 0.01) < 1 - shapeParams.probability) {
          continue;
        }
        Axis[e].extraShapes[shapeType] = shapeParams;
      }
    }
  }
}
function populateAbstractMaterials() {
  for (let f in materialTemplates) {
    let a = materialTemplates[f];
    a = {
      color: a[0],
      wireframe: a[2],
      shininess: a[1],
      enableTexture: a[3],
      textureColorVariant: pickS(a[4]),
      textureSize: a[13],
      textureNoiseSize: a[14],
      textureBase: a[11],
      textureMultiplier: a[12],
      textureBumpAmount: a[16],
      enableTextureBump: a[15],
      textureOffset: a[10],
      textureScale: a[8],
      textureRecolor: a[7],
      textureRotation: a[9],
      useTextureTransparency: a[6],
      textureBumpVariant: a[5],
    };
    let e = pickS2(SCENE.palette.colors);
    let t = e[0];
    let i = e[1];
    a.color = t;
    a.textureRecolor = i;
    let n = [undefined, undefined];
    let r = a.color;
    let o = false;
    if (typeof a.wireframe == "boolean") {
      o = a.wireframe;
    } else {
      o = randS(0, 1, 0.01) > 1 - a.wireframe;
      console.log(a.wireframe, o);
    }
    let s = a.shininess;
    let l = undefined;
    if (typeof a.enableTexture == "number") {
      a.enableTexture = randS(0, 1, 0.001) > 1 - a.enableTexture;
    }
    if (a.enableTexture) {
      if (["simple", "perlin3", "simplex3"].indexOf(a.textureColorVariant) >= 0) {
        let e = makePerlinTexture(
          a.textureSize[0],
          a.textureSize[1],
          a.textureNoiseSize[0],
          a.textureNoiseSize[1],
          a.textureBase,
          a.textureMultiplier,
          true,
          a.textureBumpAmount,
          a.textureColorVariant
        );
        n[0] = e[0];
        if (a.enableTextureBump) {
          n[1] = e[1];
        }
      } else if (a.textureColorVariant in base64Textures) {
        let e = loadTextureRecolor(
          a.textureColorVariant,
          a.textureOffset[0],
          a.textureOffset[1],
          a.textureScale[0],
          a.textureScale[1],
          a.textureRecolor,
          r,
          a.textureRotation
        );
        if (a.useTextureTransparency) {
          l = loadTextureRecolor(
            a.textureColorVariant,
            a.textureOffset[0],
            a.textureOffset[1],
            a.textureScale[0],
            a.textureScale[1],
            "#FFFFFF",
            "#000000",
            a.textureRotation
          );
        }
        n[0] = e;
        if (a.enableTextureBump) {
          if (a.textureColorVariant == a.textureBumpVariant) {
            n[1] = e;
          } else {
            let e = makePerlinTexture(
              a.textureSize[0],
              a.textureSize[1],
              a.textureNoiseSize[0],
              a.textureNoiseSize[1],
              a.textureBase,
              a.textureMultiplier,
              true,
              a.textureBumpAmount,
              a.textureColorVariant
            );
            n[1] = e[0];
          }
        }
      }
    }
    let c = {
      type: "phong",
      color: r,
      side: THREE.DoubleSide,
      wireframe: o,
      shininess: s,
      map: n[0],
      bumpMap: n[1],
      alphaMap: l,
    };
    let p = makeMaterial(c);
    p.userData.name = f;
    materialTemplates[f] = p;
  }
}
function vertexIndexSequence(n) {
  n -= 1;
  let r = [];
  for (let i = 0; i < n; i++) {
    let e = i;
    let a = i + 1;
    let t = n - i;
    if (a == t) {
      a++;
    }
    r = r.concat(e, a, t);
  }
  return r;
}
function makeExtrudeShapeMesh(e, a, t, i) {
  function n(a) {
    let t = new THREE.Shape();
    for (let e = 0; e < a.length; e++) {
      if (e == 0) {
        t.moveTo(a[e][0], a[e][1]);
      } else {
        t.lineTo(a[e][0], a[e][1]);
      }
    }
    return t;
  }
  let r = n(e);
  if (a.length > 0) {
    let e = n(a);
    r.holes.push(e);
  }
  let o = new THREE.ExtrudeGeometry(r, t);
  let s = new THREE.Mesh(o, i);
  return s;
}
function makeFrame(e, a, t, i, n, r, o, s) {
  let l = [
    [a, t],
    [a, -t],
    [-a, -t],
    [-a, t],
  ];
  let c = { steps: 2, depth: n, bevelEnabled: false };
  let p = [];
  for (let t of l) {
    let e = t[0] < 0 ? t[0] + i : t[0] - i;
    let a = t[1] < 0 ? t[1] + i : t[1] - i;
    p.push([e, a]);
  }
  let f = makeExtrudeShapeMesh(l, p, c, e);
  if (o) {
    f.position.set(o[0], o[1], o[2]);
  }
  if (r) {
    f.scale.set(r[0], r[1], r[2]);
  }
  if (s) {
    f.rotation.set(
      THREE.MathUtils.degToRad(s[0]),
      THREE.MathUtils.degToRad(s[1]),
      THREE.MathUtils.degToRad(s[2])
    );
  }
  return f;
}
function makeRectangle(e, a, t, i, n, r, o) {
  let s = [
    [a, t],
    [a, -t],
    [-a, -t],
    [-a, t],
  ];
  let l = { steps: 2, depth: i, bevelEnabled: false };
  let c = makeExtrudeShapeMesh(s, [], l, e);
  if (r) {
    c.position.set(r[0], r[1], r[2]);
  }
  if (n) {
    c.scale.set(n[0], n[1], n[2]);
  }
  if (o) {
    c.rotation.set(
      THREE.MathUtils.degToRad(o[0]),
      THREE.MathUtils.degToRad(o[1]),
      THREE.MathUtils.degToRad(o[2])
    );
  }
  return c;
}
function makeArrow(e, a, t, i, n, r, o, s, l = 0) {
  if (l == 0) {
    var c = [
      [4.23, 0.1],
      [0.65, 8.65],
      [-3.48, -0.71],
      [-0.4, 0.84],
      [-0.97, -6.59],
      [0.73, -6.52],
      [1.02, 1.08],
    ];
  } else if (l == 1) {
    var c = [
      [-4 - 0.13, 0 - 1],
      [0.65, 8.65],
      [-3.48, -0.71],
      [-0.4, -0.84],
      [-0.07, -0.09],
      [0.73, -0.52],
      [1.02, 1.08],
    ];
  } else if (l == 2) {
    var c = [
      [-4 - 0.13, 0 - 1],
      [0.65, 1.55, 8.65, 3.56, 0.22],
      [-3.48, -0.71],
      [-0.4, -0.84],
      [-0.07, -0.09],
      [0.73, -0.52],
      [1.02, 1.08],
    ];
  } else if (l == 3) {
    var c = [
      [-14 - 0.13, 10 - 1],
      [0.65, -1.55, 8.65, -3.56, 0.22],
      [-13.48, 10.71],
      [-20.4, -0.84],
      [-0.07, -0.09],
      [2.73, -0.52],
      [1.02, 1.08],
    ];
  }
  let p = {
    steps: 2,
    depth: a,
    bevelEnabled: true,
    bevelThickness: t,
    bevelSize: i,
    bevelOffset: 0,
    bevelSegments: n,
  };
  let f = makeExtrudeShapeMesh(c, [], p, e);
  if (o) {
    f.position.set(o[0], o[1], o[2]);
  }
  if (r) {
    f.scale.set(r[0], r[1], r[2]);
  }
  if (s) {
    f.rotation.set(
      THREE.MathUtils.degToRad(s[0]),
      THREE.MathUtils.degToRad(s[1]),
      THREE.MathUtils.degToRad(s[2])
    );
  }
  return f;
}
function makeKnot(e, a, t, i, n, r, o, s, l, c) {
  const p = new THREE.TorusKnotGeometry(a, t, i, n, r, o);
  p.computeVertexNormals();
  const f = new THREE.Mesh(p, e);
  if (l) {
    f.position.set(l[0], l[1], l[2]);
  }
  if (s) {
    f.scale.set(s[0], s[1], s[2]);
  }
  if (c) {
    f.rotation.set(
      THREE.MathUtils.degToRad(c[0]),
      THREE.MathUtils.degToRad(c[1]),
      THREE.MathUtils.degToRad(c[2])
    );
  }
  return f;
}
function makeMaterial(
  e = {
    type: undefined,
    color: undefined,
    side: undefined,
    wireframe: undefined,
    shininess: undefined,
    map: undefined,
    bumpMap: undefined,
    alphaMap: undefined,
  }
) {
  let a = {
    color: e.color ? e.color : "#FFFFFF",
    side: e.side,
    wireframe: e.wireframe,
    shininess: e.shininess,
  };
  if (e.map) {
    a.map = e.map;
    if (e.alphaMap) {
      a.alphaMap = e.alphaMap;
      a.alphaTest = 0.8;
      a.premultipliedAlpha = true;
    }
  }
  if (e.bumpMap) {
    a.bumpMap = e.bumpMap;
  }
  let t = new THREE.MeshPhongMaterial(a);
  t.userData.used = false;
  return t;
}
function loadTextureRecolor(e, a, t, i, n, r = undefined, o = undefined, s = undefined) {
  var l = document.createElement("canvas");
  l.width = 128;
  l.height = 128;
  var c = l.getContext("2d");
  var p = new THREE.Texture(l);
  var f = new Image();
  f.src = `data:image/png;base64,${base64Textures[e]}`;
  f.onload = function () {
    c.globalCompositeOperation = "copy";
    c.drawImage(f, 0, 0, l.width, l.height);
    if (r) {
      c.globalCompositeOperation = "source-in";
      c.fillStyle = r;
      c.fillRect(0, 0, l.width, l.height);
    }
    c.globalCompositeOperation = "destination-atop";
    c.fillStyle = o;
    c.fillRect(0, 0, l.width, l.height);
    p.wrapS = THREE.RepeatWrapping;
    p.wrapT = THREE.RepeatWrapping;
    if (a && t) {
      p.offset.set(a, t);
    }
    if (i && n) {
      p.repeat.set(i, n);
    }
    if (s) {
      p.rotation = THREE.MathUtils.degToRad(s);
    }
    p.needsUpdate = true;
  };
  return p;
}
function generateHeight(a, e) {
  let t = Math.PI / 4;
  window.Math.random = function () {
    const e = Math.sin(t++) * 1e4;
    return e - Math.floor(e);
  };
  const i = a * e,
    n = new Uint8Array(i);
  const r = new THREE.ImprovedNoise(),
    o = Math.random() * 100;
  let s = 1;
  for (let e = 0; e < 4; e++) {
    for (let e = 0; e < i; e++) {
      const l = e % a,
        c = ~~(e / a);
      n[e] += Math.abs(r.noise(l / s, c / s, o) * s * 1.75);
    }
    s *= 5;
  }
  return n;
}
function makeTerrain(e, a, i, n, t, r, o, s = 0, l, c) {
  const p = a,
    f = i;
  if (s == 0) {
    const g = generateHeight(p, f);
    var d = new THREE.PlaneGeometry(a, i, p - 1, f - 1);
    const h = d.attributes.position.array;
    d.rotateX(-Math.PI / 2);
    for (let e = 0, a = 0, t = h.length; e < t; e++, a += 3) {
      h[a + 1] = g[e] * n;
    }
  } else if (s == 1) {
    var d = new THREE.BoxGeometry(a, i, c, p - 1, f - 1, 1);
    d.rotateX(-Math.PI / 2);
    const h = d.attributes.position.array;
    let t = {};
    for (let a = 0; a < h.length - 3; a++) {
      let e = `${h[a]}_${h[a + 1]}_${h[a + 2]}`;
      if (t[e]) {
        t[e].push(a);
      } else {
        t[e] = [a];
      }
    }
    let n = [];
    for (let e of Object.keys(t)) {
      if (t[e].length > 1) {
        n.push(t[e]);
      }
    }
    for (let e = 0, i = 0, a = h.length; e < a; e++, i += 3) {
      let e = false;
      let t = randFromRange(l);
      for (let a = 0; a < n.length; a++) {
        if (n[a] && n[a].indexOf(i) > -1) {
          for (let e of n[a]) {
            h[e + 1] += t;
          }
          e = true;
        }
      }
      if (!e) {
        h[i + 1] += randFromRange(l);
      }
    }
  }
  let u = new THREE.Mesh(d, e);
  let m = n * 100;
  if (r) {
    u.position.set(r[0] - p / 10, r[1] - m, r[2]);
  }
  if (t) {
    u.scale.set(t[0], t[1], t[2]);
  }
  if (o) {
    u.rotation.set(
      THREE.MathUtils.degToRad(o[0]),
      THREE.MathUtils.degToRad(o[1]),
      THREE.MathUtils.degToRad(o[2])
    );
  }
  return u;
}
function makeCloud(a, t, i, n, r, o, e, s, l) {
  let c = new THREE.Group();
  const p = new THREE.SphereGeometry(1, 16, 16);
  for (let e = 0; e < r; e++) {
    const f = new THREE.Mesh(p, a);
    const d = Math.random() * t;
    const u = Math.random() * i;
    const m = Math.random() * n;
    f.position.set(d, u, m);
    let e = randFromRange(o);
    f.scale.set(e, e, e);
    c.add(f);
  }
  if (s) {
    c.position.set(s[0], s[1], s[2]);
  }
  if (e) {
    c.scale.set(e[0], e[1], e[2]);
  }
  if (l) {
    c.rotation.set(
      THREE.MathUtils.degToRad(l[0]),
      THREE.MathUtils.degToRad(l[1]),
      THREE.MathUtils.degToRad(l[2])
    );
  }
  return c;
}
function makeAnimationForQueue(e, a, t, i, n, r = 0.3) {
  n = n < 0 ? n * -1 : n;
  let o = { attribute: e, from: a, current: a, to: t, final: i, speed: n, counter: 0, curve: r };
  if (e == "color") {
    a = typeof a === "string" ? a : "#" + a.getHex().toString(16);
    t = Array.isArray(t) ? t : [t];
    o.colorInterpolator = new ColorInterpolator([a].concat(t), n);
  }
  return o;
}
function processAnimationQueue(a) {
  if (a.userData.animationQueue == undefined || a.userData.animationQueue.length == 0) {
    return;
  }
  if (!a.userData.animationQueue[0].direction) {
    if (Array.isArray(a.userData.animationQueue[0].from)) {
      a.userData.animationQueue[0].direction = [];
      for (let e = 0; e < a.userData.animationQueue[0].from.length; e++) {
        a.userData.animationQueue[0].direction.push(
          a.userData.animationQueue[0].from[e] > a.userData.animationQueue[0].to[e] ? -1 : 1
        );
      }
    } else {
      a.userData.animationQueue[0].direction =
        a.userData.animationQueue[0].from > a.userData.animationQueue[0].to ? -1 : 1;
    }
  }
  let t = a.userData.animationQueue[0];
  if (t.counter > 1e4) {
    a.userData.animationQueue.splice(0, 1);
    return;
  } else {
    t.counter++;
  }
  if (t.attribute == "color") {
    if (a.color) {
      let e = new THREE.Color(t.colorInterpolator.nextColor());
      a.color = e;
      if (t.colorInterpolator.looped) {
        a.userData.animationQueue.splice(0, 1);
        return;
      }
    } else {
      console.error("Shape has no color attribute");
    }
    return;
  }
  if (Array.isArray(t.from)) {
    for (let e = 0; e < t.from.length; e++) {
      if (
        (t.direction[e] == -1 && t.current[e] <= t.to[e]) ||
        (t.direction[e] == 1 && t.current[e] >= t.to[e])
      ) {
        a.userData.animationQueue.splice(0, 1);
        return;
      }
      if (t.from[e] > t.to[e]) {
        t.current[e] -= t.speed;
      } else {
        t.current[e] += t.speed;
      }
    }
  } else {
    if (t.attribute == "scale") {
      t.current = Math.max(a.scale.x, a.scale.y, a.scale.z);
    } else if (t.attribute == "rotationSpeed") {
      t.current = a.userData.rotationSpeed;
    } else if (t.attribute == "distance") {
      t.current = a.position.x;
    } else if (t.attribute == "x") {
      t.current = a.position.x;
    } else if (t.attribute == "y") {
      t.current = a.position.y;
    } else if (t.attribute == "z") {
      t.current = a.position.z;
    } else if (t.attribute == "near-far") {
      t.current[0] = a.near;
      t.current[1] = a.far;
    } else if (t.attribute == "angleX") {
      t.current = a.rotation.x;
    } else if (t.attribute == "angleY") {
      t.current = a.rotation.y;
    } else if (t.attribute == "angleZ") {
      t.current = a.rotation.z;
    }
    if ((t.direction == -1 && t.current <= t.to) || (t.direction == 1 && t.current >= t.to)) {
      a.userData.animationQueue.splice(0, 1);
      return;
    }
    if (t.from >= t.to) {
      t.current -= t.speed;
    } else {
      t.current += t.speed;
    }
  }
  if (a.userData.name == "camera") {
    t.current = Number(t.current.toFixed(5));
  }
  if (t.attribute == "scale") {
    if (Array.isArray(t.from)) {
      a.scale.set(t.current[0], t.current[1], t.current[2]);
    } else {
      a.scale.set(t.current, t.current, t.current);
    }
    if (Array.isArray(a.material)) {
      for (let e = 0; e < a.material.length; e++) {
        if (a.material[e].map) {
          a.material[e].map.needsUpdate = true;
        }
      }
    } else {
      if (a.material && a.material.map) {
        a.material.map.needsUpdate = true;
      }
    }
  } else if (t.attribute == "rotationSpeed") {
    a.userData.rotationSpeed = t.current;
  } else if (t.attribute == "distance") {
    a.position.x = t.current;
  } else if (t.attribute == "x") {
    a.position.x = t.current;
  } else if (t.attribute == "y") {
    a.position.y = t.current;
  } else if (t.attribute == "z") {
    a.position.z = t.current;
  } else if (t.attribute == "near-far") {
    a.near = t.current[0];
    a.far = t.current[1];
  } else if (t.attribute == "angleX") {
    a.rotation.x = t.current;
  } else if (t.attribute == "angleY") {
    a.rotation.y = t.current;
  } else if (t.attribute == "angleZ") {
    a.rotation.z = t.current;
  }
}
function processAnimationLoop(t) {
  if (t.userData.animationLoop.length == 0) {
    return;
  }
  for (let a of t.userData.animationLoop) {
    if (a.attribute == "color") {
      if (t.color) {
        let e = new THREE.Color(a.colorInterpolator.nextColor());
        t.color = e;
        if (a.colorInterpolator.looped) {
          t.userData.animationQueue.splice(0, 1);
          return;
        }
      } else {
        console.error("Shape has no color attribute");
      }
      return;
    }
    if (a.attribute == "scale") {
      a.current = Math.max(t.scale.x, t.scale.y, t.scale.z);
    } else if (a.attribute == "rotationSpeed") {
      a.current = t.userData.rotationSpeed;
    } else if (a.attribute == "distance") {
      a.current = t.position.x;
    } else if (a.attribute == "x") {
      a.current = t.position.x;
    } else if (a.attribute == "y") {
      a.current = t.position.y;
    } else if (a.attribute == "z") {
      a.current = t.position.z;
    } else if (a.attribute == "near-far") {
      a.current[0] = t.near;
      a.current[1] = t.far;
    } else if (a.attribute == "angleX") {
      a.current = t.rotation.x;
    } else if (a.attribute == "angleY") {
      a.current = t.rotation.y;
    } else if (a.attribute == "angleZ") {
      a.current = t.rotation.z;
    }
    if (a.from >= a.to) {
      a.current -= a.speed;
    } else {
      a.current += a.speed;
    }
    if (a.attribute == "scale") {
      t.scale.set(a.current, a.current, a.current);
      if (Array.isArray(t.material)) {
        for (let e = 0; e < t.material.length; e++) {
          if (t.material[e].map) {
            t.material[e].map.needsUpdate = true;
          }
        }
      } else {
        if (t.material.map) {
          t.material.map.needsUpdate = true;
        }
      }
    } else if (a.attribute == "rotationSpeed") {
      t.userData.rotationSpeed = a.current;
    } else if (a.attribute == "distance") {
      t.position.x = a.current;
    } else if (a.attribute == "x") {
      t.position.x = a.current;
    } else if (a.attribute == "y") {
      t.position.y = a.current;
    } else if (a.attribute == "z") {
      t.position.z = a.current;
    } else if (a.attribute == "near-far") {
      t.near = a.current[0];
      t.far = a.current[1];
    } else if (a.attribute == "angleX") {
      t.rotation.x = a.current;
    } else if (a.attribute == "angleY") {
      t.rotation.y = a.current;
    } else if (a.attribute == "angleZ") {
      t.rotation.z = a.current;
    }
  }
}
function interpolateColors(e, a, i) {
  const t = (e) => [parseInt(e.slice(1, 3), 16), parseInt(e.slice(3, 5), 16), parseInt(e.slice(5, 7), 16)];
  const n = (e) => "#" + e.map((e) => Math.round(e).toString(16).padStart(2, "0")).join("");
  const r = t(e);
  const o = t(a);
  const s = r.map((e, a) => {
    const t = o[a];
    return Math.round(e + (t - e) * i);
  });
  return n(s);
}
class ColorInterpolator {
  constructor(e, a) {
    this.colorsArray = e;
    this.activePairIndex = [0, 1];
    this.speed = a;
    this.state = 0;
    this.looped = false;
  }
  nextColor() {
    let e = interpolateColors(
      this.colorsArray[this.activePairIndex[0]],
      this.colorsArray[this.activePairIndex[1]],
      this.state
    );
    this.state += this.speed;
    if (this.state >= 1) {
      this.state = 0;
      if (this.activePairIndex[1] >= this.colorsArray.length) {
        this.activePairIndex = this.activePairIndex.map((e) => e + 1);
      } else {
        this.activePairIndex = [0, 1];
        this.looped = true;
      }
    }
    return e;
  }
}
function createConeGeometry(e, a, o, s, l, t) {
  if (!l) {
    l = {};
  }
  const i = new THREE.BufferGeometry();
  let c = [];
  let n = [];
  const p = 0;
  const f = e;
  for (let r = 0; r <= s; r++) {
    const h = (r / s) * a;
    const E = f + (h / a) * (p - f);
    for (let n = 0; n <= o; n++) {
      let a = h;
      let e = (n / o) * Math.PI * 2;
      let t = E * Math.cos(e);
      let i = E * Math.sin(e);
      if (l.curveBaseCone) {
        let e = (s - r) * l.baseCurveFactor;
        a -= Math.abs(Math.pow(t, 2)) * e;
      }
      c.push(t, a, i);
    }
  }
  for (let a = 0; a < s; a++) {
    for (let e = 0; e < o; e++) {
      const S = a * (o + 1) + e;
      const b = S + o + 1;
      if (e == 0) {
        var r = S;
        var d = b;
      }
      if (e < o - 1) {
        n.push(S, b, S + 1);
        n.push(b, b + 1, S + 1);
      } else {
        n.push(S, b, r);
        n.push(b, d, r);
      }
    }
  }
  let u = 0;
  let m = 100;
  let g = 0;
  for (let e = 2; e < o * 3; e += 3) {
    g++;
    if (c[e] < u) {
      u = g;
      m = c[e];
    }
  }
  c.indexOf(Math.min(c.slice(0, o)));
  if (!t) {
    c = c.slice(0, o * 3).concat(c);
    n = n.map((e) => e + o);
    let a = Math.abs(o / 2);
    if (l.curveBaseCone) {
      n = n.concat(vertexIndexSequence(o));
    } else {
      for (let e = 0; e < a; e += 1) {
        n.push(e, e + 1, a);
        n.push(e + a, e + a + 1, a);
      }
    }
  }
  i.setAttribute("position", new THREE.Float32BufferAttribute(c, 3));
  i.deleteAttribute("normal");
  i.deleteAttribute("uv");
  i.setIndex(n);
  i.computeVertexNormals();
  return i;
}
function makeCone(e, a, t, i, n, r, o, s, l, c) {
  const p = createConeGeometry(a, t, i, n, c, r);
  const f = new THREE.ConeGeometry(a, t, i, n);
  p.setAttribute("uv", f.getAttribute("uv"));
  p.uvsNeedUpdate = true;
  p.normalsNeedUpdate = true;
  const d = new THREE.Mesh(p, e);
  if (s) {
    d.position.set(s[0], s[1], s[2]);
  }
  if (o) {
    d.scale.set(o[0], o[1], o[2]);
  }
  if (l) {
    d.rotation.set(
      THREE.MathUtils.degToRad(l[0] * 2),
      THREE.MathUtils.degToRad(l[1]),
      THREE.MathUtils.degToRad(l[2])
    );
  }
  if (enableShadows) {
    d.castShadow = true;
    d.receiveShadow = true;
  }
  d.userData.material = e;
  return d;
}
function meanPositionOfPivots(e) {
  let a = e.map((e) => e.position.x);
  a = a.reduce((e, a) => e + a, 0) / a.length;
  let t = e.map((e) => e.position.y);
  t = t.reduce((e, a) => e + a, 0) / t.length;
  let i = e.map((e) => e.position.z);
  i = i.reduce((e, a) => e + a, 0) / i.length;
  return [a, t, i];
}
function meanRotationOfPivots(e) {
  let a = e.map((e) => e.rotation.x);
  a = a.reduce((e, a) => e + a, 0) / a.length;
  let t = e.map((e) => e.rotation.y);
  t = t.reduce((e, a) => e + a, 0) / t.length;
  let i = e.map((e) => e.rotation.z);
  i = i.reduce((e, a) => e + a, 0) / i.length;
  return [a, t, i];
}
function createNegativeSpace(t, e = undefined, a = true, i = 0, n = 0) {
  t.creatingNegativeSpace = true;
  setTimeout(() => {
    t.creatingNegativeSpace = false;
  }, 3e4);
  let r = randFromRange(t.negativeSpaceX);
  let o = randFromRange(t.negativeSpaceY);
  let s = randFromRange(t.negativeSpaceZ);
  let l = randFromRange(t.negativeSpaceSizeX);
  let c = randFromRange(t.negativeSpaceSizeY);
  let p = randFromRange(t.negativeSpaceSizeZ);
  if (e == undefined) {
    e = pick(t.negativeSpaceType);
  }
  let f = undefined;
  if (e == "triangle") {
    f = [
      new THREE.Plane(new THREE.Vector3(1, 0.5, 0), 0),
      new THREE.Plane(new THREE.Vector3(-1, 0.5, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    ];
    f[0].translate(new THREE.Vector3(l + r, 0, 0));
    f[1].translate(new THREE.Vector3(-l + r, 0, 0));
    f[2].translate(new THREE.Vector3(0, -c + o, 0));
    f[3].translate(new THREE.Vector3(0, 0, -p + s));
    f[4].translate(new THREE.Vector3(0, 0, p + s));
  } else if (e == "triangle_flip") {
    f = [
      new THREE.Plane(new THREE.Vector3(1, -0.5, 0), 0),
      new THREE.Plane(new THREE.Vector3(-1, -0.5, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    ];
    f[0].translate(new THREE.Vector3(l + r, 0, 0));
    f[1].translate(new THREE.Vector3(-l + r, 0, 0));
    f[2].translate(new THREE.Vector3(0, c + o, 0));
    f[3].translate(new THREE.Vector3(0, 0, -p + s));
    f[4].translate(new THREE.Vector3(0, 0, p + s));
  } else if (e == "diamond") {
    f = [
      new THREE.Plane(new THREE.Vector3(1, -0.5, 0), 0),
      new THREE.Plane(new THREE.Vector3(-1, 0.5, 0), 0),
      new THREE.Plane(new THREE.Vector3(0.5, -1, 0), 0),
      new THREE.Plane(new THREE.Vector3(-0.5, 1, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    ];
    f[0].translate(new THREE.Vector3(l + r, 0, 0));
    f[1].translate(new THREE.Vector3(-l + r, 0, 0));
    f[2].translate(new THREE.Vector3(0, -c + o, 0));
    f[3].translate(new THREE.Vector3(0, c + o, 0));
    f[4].translate(new THREE.Vector3(0, 0, -p + s));
    f[5].translate(new THREE.Vector3(0, 0, p + s));
    var d = new THREE.Quaternion();
    d.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(n));
    f[0].normal.applyQuaternion(d);
    f[1].normal.applyQuaternion(d);
    f[2].normal.applyQuaternion(d);
    f[3].normal.applyQuaternion(d);
  }
  let u = e == "triangle" ? 3 : 4;
  for (let e = 0; e < u; e++) {
    f[e].userData = {
      originalConstant: f[e].constant,
      currentConstrain: a ? 5 : f[e].constant,
      desiredConstant: f[e].constant,
    };
    if (a) {
      f[e].constant = 5;
    }
  }
  t.clipPlanes = f;
  nShapesLeftOutside = 0;
  if (t.pivots) {
    for (let e of t.pivots) {
      if (nShapesLeftOutside < i && rand(0, 1, 0.01) > 0.5) {
        nShapesLeftOutside++;
        continue;
      }
      for (let a of e.children) {
        if (a.material) {
          a.material.clippingPlanes = t.clipPlanes;
          a.material.clipIntersection = true;
        }
        for (let e of a.children) {
          if (e.material) {
            e.material.clippingPlanes = t.clipPlanes;
            e.material.clipIntersection = true;
          }
        }
      }
    }
  }
  console.log(nShapesLeftOutside, "objects left outside of negative space on axis", t.name);
}
function removeNegativeSpace(a) {
  a.removingNegativeSpace = true;
  for (let e = 0; e < a.clipPlanes.length; e++) {
    if (a.clipPlanes[e].userData) {
      a.clipPlanes[e].userData.desiredConstant = 5;
    }
  }
  setTimeout(() => {
    if (a.pivots) {
      for (let e of a.pivots) {
        for (let a of e.children) {
          if (a.material) {
            a.material.clippingPlanes = [];
            a.material.needsUpdate = true;
          }
          for (let e of a.children) {
            if (e.material) {
              e.material.clippingPlanes = [];
              e.material.needsUpdate = true;
            }
          }
        }
      }
    }
    for (let e = 0; e < a.clipPlanes.length; e++) {
      SCENE.scene.remove(a.clipPlanes[e]);
    }
    a.clipPlanes = undefined;
    delete a.clipPlanes;
    a.removingNegativeSpace = false;
  }, 2e4);
}
function initOBJLoader() {
  const _ = /^[og]\s*(.+)?/;
  const H = /^mtllib /;
  const X = /^usemtl /;
  const Y = /^usemap /;
  const j = /\s+/;
  const r = new THREE.Vector3();
  const o = new THREE.Vector3();
  const s = new THREE.Vector3();
  const l = new THREE.Vector3();
  const c = new THREE.Vector3();
  const Z = new THREE.Color();
  function z() {
    const e = {
      objects: [],
      object: {},
      vertices: [],
      normals: [],
      colors: [],
      uvs: [],
      materials: {},
      materialLibraries: [],
      startObject: function (e, a) {
        if (this.object && this.object.fromDeclaration === false) {
          this.object.name = e;
          this.object.fromDeclaration = a !== false;
          return;
        }
        const t =
          this.object && typeof this.object.currentMaterial === "function"
            ? this.object.currentMaterial()
            : undefined;
        if (this.object && typeof this.object._finalize === "function") {
          this.object._finalize(true);
        }
        this.object = {
          name: e || "",
          fromDeclaration: a !== false,
          geometry: { vertices: [], normals: [], colors: [], uvs: [], hasUVIndices: false },
          materials: [],
          smooth: true,
          startMaterial: function (e, a) {
            const t = this._finalize(false);
            if (t && (t.inherited || t.groupCount <= 0)) {
              this.materials.splice(t.index, 1);
            }
            const i = {
              index: this.materials.length,
              name: e || "",
              mtllib: Array.isArray(a) && a.length > 0 ? a[a.length - 1] : "",
              smooth: t !== undefined ? t.smooth : this.smooth,
              groupStart: t !== undefined ? t.groupEnd : 0,
              groupEnd: -1,
              groupCount: -1,
              inherited: false,
              clone: function (e) {
                const a = {
                  index: typeof e === "number" ? e : this.index,
                  name: this.name,
                  mtllib: this.mtllib,
                  smooth: this.smooth,
                  groupStart: 0,
                  groupEnd: -1,
                  groupCount: -1,
                  inherited: false,
                };
                a.clone = this.clone.bind(a);
                return a;
              },
            };
            this.materials.push(i);
            return i;
          },
          currentMaterial: function () {
            if (this.materials.length > 0) {
              return this.materials[this.materials.length - 1];
            }
            return undefined;
          },
          _finalize: function (e) {
            const a = this.currentMaterial();
            if (a && a.groupEnd === -1) {
              a.groupEnd = this.geometry.vertices.length / 3;
              a.groupCount = a.groupEnd - a.groupStart;
              a.inherited = false;
            }
            if (e && this.materials.length > 1) {
              for (let e = this.materials.length - 1; e >= 0; e--) {
                if (this.materials[e].groupCount <= 0) {
                  this.materials.splice(e, 1);
                }
              }
            }
            if (e && this.materials.length === 0) {
              this.materials.push({ name: "", smooth: this.smooth });
            }
            return a;
          },
        };
        if (t && t.name && typeof t.clone === "function") {
          const i = t.clone(0);
          i.inherited = true;
          this.object.materials.push(i);
        }
        this.objects.push(this.object);
      },
      finalize: function () {
        if (this.object && typeof this.object._finalize === "function") {
          this.object._finalize(true);
        }
      },
      parseVertexIndex: function (e, a) {
        const t = parseInt(e, 10);
        return (t >= 0 ? t - 1 : t + a / 3) * 3;
      },
      parseNormalIndex: function (e, a) {
        const t = parseInt(e, 10);
        return (t >= 0 ? t - 1 : t + a / 3) * 3;
      },
      parseUVIndex: function (e, a) {
        const t = parseInt(e, 10);
        return (t >= 0 ? t - 1 : t + a / 2) * 2;
      },
      addVertex: function (e, a, t) {
        const i = this.vertices;
        const n = this.object.geometry.vertices;
        n.push(i[e + 0], i[e + 1], i[e + 2]);
        n.push(i[a + 0], i[a + 1], i[a + 2]);
        n.push(i[t + 0], i[t + 1], i[t + 2]);
      },
      addVertexPoint: function (e) {
        const a = this.vertices;
        const t = this.object.geometry.vertices;
        t.push(a[e + 0], a[e + 1], a[e + 2]);
      },
      addVertexLine: function (e) {
        const a = this.vertices;
        const t = this.object.geometry.vertices;
        t.push(a[e + 0], a[e + 1], a[e + 2]);
      },
      addNormal: function (e, a, t) {
        const i = this.normals;
        const n = this.object.geometry.normals;
        n.push(i[e + 0], i[e + 1], i[e + 2]);
        n.push(i[a + 0], i[a + 1], i[a + 2]);
        n.push(i[t + 0], i[t + 1], i[t + 2]);
      },
      addFaceNormal: function (e, a, t) {
        const i = this.vertices;
        const n = this.object.geometry.normals;
        r.fromArray(i, e);
        o.fromArray(i, a);
        s.fromArray(i, t);
        c.subVectors(s, o);
        l.subVectors(r, o);
        c.cross(l);
        c.normalize();
        n.push(c.x, c.y, c.z);
        n.push(c.x, c.y, c.z);
        n.push(c.x, c.y, c.z);
      },
      addColor: function (e, a, t) {
        const i = this.colors;
        const n = this.object.geometry.colors;
        if (i[e] !== undefined) n.push(i[e + 0], i[e + 1], i[e + 2]);
        if (i[a] !== undefined) n.push(i[a + 0], i[a + 1], i[a + 2]);
        if (i[t] !== undefined) n.push(i[t + 0], i[t + 1], i[t + 2]);
      },
      addUV: function (e, a, t) {
        const i = this.uvs;
        const n = this.object.geometry.uvs;
        n.push(i[e + 0], i[e + 1]);
        n.push(i[a + 0], i[a + 1]);
        n.push(i[t + 0], i[t + 1]);
      },
      addDefaultUV: function () {
        const e = this.object.geometry.uvs;
        e.push(0, 0);
        e.push(0, 0);
        e.push(0, 0);
      },
      addUVLine: function (e) {
        const a = this.uvs;
        const t = this.object.geometry.uvs;
        t.push(a[e + 0], a[e + 1]);
      },
      addFace: function (e, a, t, i, n, r, o, s, l) {
        const c = this.vertices.length;
        let p = this.parseVertexIndex(e, c);
        let f = this.parseVertexIndex(a, c);
        let d = this.parseVertexIndex(t, c);
        this.addVertex(p, f, d);
        this.addColor(p, f, d);
        if (o !== undefined && o !== "") {
          const u = this.normals.length;
          p = this.parseNormalIndex(o, u);
          f = this.parseNormalIndex(s, u);
          d = this.parseNormalIndex(l, u);
          this.addNormal(p, f, d);
        } else {
          this.addFaceNormal(p, f, d);
        }
        if (i !== undefined && i !== "") {
          const m = this.uvs.length;
          p = this.parseUVIndex(i, m);
          f = this.parseUVIndex(n, m);
          d = this.parseUVIndex(r, m);
          this.addUV(p, f, d);
          this.object.geometry.hasUVIndices = true;
        } else {
          this.addDefaultUV();
        }
      },
      addPointGeometry: function (t) {
        this.object.geometry.type = "Points";
        const i = this.vertices.length;
        for (let e = 0, a = t.length; e < a; e++) {
          const n = this.parseVertexIndex(t[e], i);
          this.addVertexPoint(n);
          this.addColor(n);
        }
      },
      addLineGeometry: function (t, i) {
        this.object.geometry.type = "Line";
        const n = this.vertices.length;
        const r = this.uvs.length;
        for (let e = 0, a = t.length; e < a; e++) {
          this.addVertexLine(this.parseVertexIndex(t[e], n));
        }
        for (let e = 0, a = i.length; e < a; e++) {
          this.addUVLine(this.parseUVIndex(i[e], r));
        }
      },
    };
    e.startObject("", false);
    return e;
  }
  class e extends THREE.Loader {
    constructor(e) {
      super(e);
      this.materials = null;
    }
    load(t, i, e, n) {
      const r = this;
      const a = new THREE.FileLoader(this.manager);
      a.setPath(this.path);
      a.setRequestHeader(this.requestHeader);
      a.setWithCredentials(this.withCredentials);
      a.load(
        t,
        function (e) {
          try {
            i(r.parse(e));
          } catch (a) {
            if (n) {
              n(a);
            } else {
              console.error(a);
            }
            r.manager.itemError(t);
          }
        },
        e,
        n
      );
    }
    setMaterials(e) {
      this.materials = e;
      return this;
    }
    parse(e) {
      const i = new z();
      if (e.indexOf("\r\n") !== -1) {
        e = e.replace(/\r\n/g, "\n");
      }
      if (e.indexOf("\\\n") !== -1) {
        e = e.replace(/\\\n/g, "");
      }
      const t = e.split("\n");
      let n = [];
      for (let e = 0, a = t.length; e < a; e++) {
        const o = t[e].trimStart();
        if (o.length === 0) continue;
        const s = o.charAt(0);
        if (s === "#") continue;
        if (s === "v") {
          const l = o.split(j);
          switch (l[0]) {
            case "v":
              i.vertices.push(parseFloat(l[1]), parseFloat(l[2]), parseFloat(l[3]));
              if (l.length >= 7) {
                Z.setRGB(parseFloat(l[4]), parseFloat(l[5]), parseFloat(l[6])).convertSRGBToLinear();
                i.colors.push(Z.r, Z.g, Z.b);
              } else {
                i.colors.push(undefined, undefined, undefined);
              }
              break;
            case "vn":
              i.normals.push(parseFloat(l[1]), parseFloat(l[2]), parseFloat(l[3]));
              break;
            case "vt":
              i.uvs.push(parseFloat(l[1]), parseFloat(l[2]));
              break;
          }
        } else if (s === "f") {
          const c = o.slice(1).trim();
          const p = c.split(j);
          const f = [];
          for (let e = 0, a = p.length; e < a; e++) {
            const u = p[e];
            if (u.length > 0) {
              const m = u.split("/");
              f.push(m);
            }
          }
          const d = f[0];
          for (let e = 1, a = f.length - 1; e < a; e++) {
            const g = f[e];
            const h = f[e + 1];
            i.addFace(d[0], g[0], h[0], d[1], g[1], h[1], d[2], g[2], h[2]);
          }
        } else if (s === "l") {
          const E = o.substring(1).trim().split(" ");
          let t = [];
          const S = [];
          if (o.indexOf("/") === -1) {
            t = E;
          } else {
            for (let e = 0, a = E.length; e < a; e++) {
              const b = E[e].split("/");
              if (b[0] !== "") t.push(b[0]);
              if (b[1] !== "") S.push(b[1]);
            }
          }
          i.addLineGeometry(t, S);
        } else if (s === "p") {
          const c = o.slice(1).trim();
          const v = c.split(" ");
          i.addPointGeometry(v);
        } else if ((n = _.exec(o)) !== null) {
          const x = (" " + n[0].slice(1).trim()).slice(1);
          i.startObject(x);
        } else if (X.test(o)) {
          i.object.startMaterial(o.substring(7).trim(), i.materialLibraries);
        } else if (H.test(o)) {
          i.materialLibraries.push(o.substring(7).trim());
        } else if (Y.test(o)) {
          console.warn(
            'THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.'
          );
        } else if (s === "s") {
          n = o.split(" ");
          if (n.length > 1) {
            const y = n[1].trim().toLowerCase();
            i.object.smooth = y !== "0" && y !== "off";
          } else {
            i.object.smooth = true;
          }
          const T = i.object.currentMaterial();
          if (T) T.smooth = i.object.smooth;
        } else {
          if (o === "\0") continue;
          console.warn('THREE.OBJLoader: Unexpected line: "' + o + '"');
        }
      }
      i.finalize();
      const r = new THREE.Group();
      r.materialLibraries = [].concat(i.materialLibraries);
      const a = !(i.objects.length === 1 && i.objects[0].geometry.vertices.length === 0);
      if (a === true) {
        for (let a = 0, e = i.objects.length; a < e; a++) {
          const A = i.objects[a];
          const R = A.geometry;
          const w = A.materials;
          const C = R.type === "Line";
          const D = R.type === "Points";
          let t = false;
          if (R.vertices.length === 0) continue;
          const N = new THREE.BufferGeometry();
          N.setAttribute("position", new THREE.Float32BufferAttribute(R.vertices, 3));
          if (R.normals.length > 0) {
            N.setAttribute("normal", new THREE.Float32BufferAttribute(R.normals, 3));
          }
          if (R.colors.length > 0) {
            t = true;
            N.setAttribute("color", new THREE.Float32BufferAttribute(R.colors, 3));
          }
          if (R.hasUVIndices === true) {
            N.setAttribute("uv", new THREE.Float32BufferAttribute(R.uvs, 2));
          }
          const M = [];
          for (let a = 0, e = w.length; a < e; a++) {
            const P = w[a];
            const O = P.name + "_" + P.smooth + "_" + t;
            let e = i.materials[O];
            if (this.materials !== null) {
              e = this.materials.create(P.name);
              if (C && e && !(e instanceof THREE.LineBasicMaterial)) {
                const F = new THREE.LineBasicMaterial();
                THREE.Material.prototype.copy.call(F, e);
                F.color.copy(e.color);
                e = F;
              } else if (D && e && !(e instanceof THREE.PointsMaterial)) {
                const U = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false });
                THREE.Material.prototype.copy.call(U, e);
                U.color.copy(e.color);
                U.map = e.map;
                e = U;
              }
            }
            if (e === undefined) {
              if (C) {
                e = new THREE.LineBasicMaterial();
              } else if (D) {
                e = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false });
              } else {
                e = new THREE.MeshPhongMaterial({ color: "#000000" });
              }
              e.name = P.name;
              e.flatShading = P.smooth ? false : true;
              e.vertexColors = t;
              i.materials[O] = e;
            }
            M.push(e);
          }
          let e;
          if (M.length > 1) {
            for (let e = 0, a = w.length; e < a; e++) {
              const P = w[e];
              N.addGroup(P.groupStart, P.groupCount, e);
            }
            if (C) {
              e = new THREE.LineSegments(N, M);
            } else if (D) {
              e = new THREE.Points(N, M);
            } else {
              e = new THREE.Mesh(N, M);
            }
          } else {
            if (C) {
              e = new THREE.LineSegments(N, M[0]);
            } else if (D) {
              e = new THREE.Points(N, M[0]);
            } else {
              e = new THREE.Mesh(N, M[0]);
            }
          }
          e.name = A.name;
          r.add(e);
        }
      } else {
        if (i.vertices.length > 0) {
          const T = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false });
          const N = new THREE.BufferGeometry();
          N.setAttribute("position", new THREE.Float32BufferAttribute(i.vertices, 3));
          if (i.colors.length > 0 && i.colors[0] !== undefined) {
            N.setAttribute("color", new THREE.Float32BufferAttribute(i.colors, 3));
            T.vertexColors = true;
          }
          const k = new THREE.Points(N, T);
          r.add(k);
        }
      }
      return r;
    }
  }
  THREE.OBJLoader = e;
}
function initImprovedNoise() {
  const x = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99,
    37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
    57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27,
    166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102,
    143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116,
    188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126,
    255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152,
    2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113,
    224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
    81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
    61, 156, 180,
  ];
  for (let e = 0; e < 256; e++) {
    x[256 + e] = x[e];
  }
  function T(e) {
    return e * e * e * (e * (e * 6 - 15) + 10);
  }
  function y(e, a, t) {
    return a + e * (t - a);
  }
  function A(e, a, t, i) {
    const n = e & 15;
    const r = n < 8 ? a : t,
      o = n < 4 ? t : n == 12 || n == 14 ? a : i;
    return ((n & 1) == 0 ? r : -r) + ((n & 2) == 0 ? o : -o);
  }
  class e {
    noise(e, a, t) {
      const i = Math.floor(e),
        n = Math.floor(a),
        r = Math.floor(t);
      const o = i & 255,
        s = n & 255,
        l = r & 255;
      e -= i;
      a -= n;
      t -= r;
      const c = e - 1,
        p = a - 1,
        f = t - 1;
      const d = T(e),
        u = T(a),
        m = T(t);
      const g = x[o] + s,
        h = x[g] + l,
        E = x[g + 1] + l,
        S = x[o + 1] + s,
        b = x[S] + l,
        v = x[S + 1] + l;
      return y(
        m,
        y(u, y(d, A(x[h], e, a, t), A(x[b], c, a, t)), y(d, A(x[E], e, p, t), A(x[v], c, p, t))),
        y(
          u,
          y(d, A(x[h + 1], e, a, f), A(x[b + 1], c, a, f)),
          y(d, A(x[E + 1], e, p, f), A(x[v + 1], c, p, f))
        )
      );
    }
  }
  THREE.ImprovedNoise = e;
}
function stringToHexadecimal(a) {
  let t = "";
  for (let e = 0; e < a.length; e++) {
    const i = a.charCodeAt(e).toString(16);
    t += ("00" + i).slice(-2);
  }
  return t;
}
async function callProvider(e) {
  callPayload = { method: "POST", body: JSON.stringify(e) };
  let t;
  for (let a = 0; a < NODE_PROVIDER_URLS.length; a++) {
    try {
      t = await fetch(NODE_PROVIDER_URLS[a], callPayload);
      let e = await t.json();
      return e;
    } catch (i) {
      console.warn("Failed node provider URL:", NODE_PROVIDER_URLS[a]);
    }
  }
}
async function getLastBlockReceipts(a) {
  let e = await callProvider({ method: "eth_blockNumber", params: [], id: 2, jsonrpc: "2.0" });
  let t = await callProvider({ method: "eth_getBlockReceipts", params: [e.result], id: 2, jsonrpc: "2.0" });
  for (let e of t.result) {
    if (a == "ANYWALLET") {
      const i = JSON.stringify(e, null, 2);
      return i;
    }
    if (a.indexOf(e.from) > -1 || a.indexOf(e.to) > -1) {
      const i = JSON.stringify(e, null, 2);
      return i;
    }
  }
}
async function receiptsWrapper() {
  try {
    await getLastBlockReceipts();
  } catch (e) {
    console.error(e);
  }
}
async function getContractData() {
  for (let t = 0; t < NODE_PROVIDER_URLS.length; t++) {
    try {
      var i = await fetch(NODE_PROVIDER_URLS[t], {
        method: "POST",
        body: JSON.stringify({
          method: "eth_call",
          params: [{ to: contractAddress, data: jsonRpcCallDataContract }, "latest"],
          id: 2,
          jsonrpc: "2.0",
        }),
      });
      let e = await i.json();
      let a = hexToArray(e.result);
      try {
        a = splitArray(a, [1, 200, 1, 200, 1, 400, 400, 1, 300]);
      } catch (n) {
        console.error(n);
        a = splitArray(a, [1, 200, 1, 200, 1, 400, 400, 1]);
      }
      console.debug("contract_data:", a);
      return a;
    } catch (n) {
      console.log("Node failed:", NODE_PROVIDER_URLS[t]);
    }
  }
}
function hexToUnicode(e) {
  let a = e.match(/.{1,2}/g) || [];
  let t = a.map((e) => String.fromCharCode(parseInt(e, 16)));
  let i = t.join("");
  return i.replace(/\u0000/g, "");
}
function hexToArray(e) {
  const a = e.slice(2);
  const t = [];
  for (let e = 0; e < a.length; e += 64) {
    if (e >= 77200) {
      const i = hexToUnicode(a.slice(e, e + 128), 16);
      if (i.length >= 37 && i[0] == 0) {
        t.push(i);
        console.log(i);
      }
    } else {
      const n = parseInt(a.slice(e, e + 64), 16);
      t.push(n);
    }
  }
  return t;
}
function splitArray(a, t) {
  const i = [];
  let n = 0;
  for (let e = 0; e < t.length; e++) {
    const r = t[e];
    const o = a.slice(n, n + r);
    i.push(o);
    n += r;
  }
  if (n < a.length) {
    const e = a.slice(n);
    i.push(e);
  }
  return i;
}
function getCurrentTs() {
  return new Date().getTime() / 1e3;
}
function generateUUID() {
  return "xyxxyxxxyxxyxx".replace(/[xy]/g, function (e) {
    var a = (Math.random() * 16) | 0,
      t = e == "x" ? a : (a & 3) | 8;
    return t.toString(16);
  });
}
