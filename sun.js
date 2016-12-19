var MS_PER_MINUTE = 60000;
var J_UNIX_EPOCH = 2440587.5;
var MS_PER_DAY = 86400000;

var n = -1;
var s = -1;
var r = -1;
var c1 = 357.5291;
var c2 = 0.98560028;
var c3 = 1.9148;
var c4 = 0.0200;
var c5 = 0.0003;
var c6 = 282.9372;
var c7 = 2451545.5;
var c8 = 0.0053;
var c9 = 0.0069;
var c10 = Math.sin(23.44 * Math.PI / 180);
var c11 = Math.sin(-0.83 * Math.PI / 180);

//https://en.wikipedia.org/wiki/Sunrise_equation
//l is longitude, phi is latitude
function riseset(date, l, phi){
	setN(date);
	return {'set':jtog(S(l, phi)), 'rise':jtog(R(l, phi))};
}

function jtog(j){
	return new Date(MS_PER_DAY*(j - J_UNIX_EPOCH))
}

function gtoj(g){
	return J_UNIX_EPOCH + g / MS_PER_DAY;
}

function floorgtoj(g){
	return J_UNIX_EPOCH + Math.floor(floordate(g) / MS_PER_DAY);
}

function floordate(g){
	return new Date(g.getFullYear(), g.getMonth(), g.getDate());
}

function setN(given){
	n = floorgtoj(given) - 2451545.0008;
}

function setS(given){
	s = gtoj(given);
}

function setR(given){
	r = gtoj(given);
}

function getS(){
	return s;
}
function getR(){
	return r;
}
function getN(){
	return n;
}

function M(l){
	//~ document.getElementById("test-div").innerHTML = n + "<br>";
	return (c1 + c2*(n - l/360)) % 360 * Math.PI / 180;
}

function C(l){
	return c3*Math.sin(M(l)) + c4*Math.sin(2*M(l)) + c5*Math.sin(3*M(l));
}

function L(l){
	return (M(l) + C(l) + c6) % 360 * Math.PI / 180;
}

function J(l){
	return c7 + n - l/360 + c8*Math.sin(M(l)) - c9*Math.sin(2*L(l));
}

function Delta(l){
	return Math.asin(c10*Math.sin(L(l)));
}

function W(l, phi){
	return Math.acos( (c11 - Math.sin(phi*Math.PI/180)*Math.sin(Delta(l))) / (Math.cos(phi*Math.PI/180)*Math.cos(Delta(l))) );
}

function S(l, phi){
	return J(l) + W(l, phi)/(2*Math.PI);
}

function R(l, phi){
	return J(l) - W(l, phi)/(2*Math.PI);
}

function Q(l, phi){
	return (Math.pow(S(l, phi)-s, 2)+1) * (Math.pow(R(l, phi)-r, 2)+1);
}

function Q_l(l, phi){
	return Math.pow(S(l, phi)-s, 2) * 2 * R_l(l, phi) * (R(l, phi) - r)
		+  Math.pow(R(l, phi)-r, 2) * 2 * S_l(l, phi) * (S(l, phi) - s)
		+  2 * S_l(l, phi) * (S(l, phi) - s)
		+  2 * R_l(l, phi) * (R(l, phi) - r);
}

function Q_phi(l, phi){
	return Math.pow(S(l, phi)-s, 2) * 2 * R_phi(l, phi) * (R(l, phi) - r)
		+  Math.pow(R(l, phi)-r, 2) * 2 * S_phi(l, phi) * (S(l, phi) - s)
		+  2 * S_phi(l, phi) * (S(l, phi) - s)
		+  2 * R_phi(l, phi) * (R(l, phi) - r);
}

function M_l(l){
	return -c2/360* Math.PI / 180;
}

function C_l(l){
	return c3*M_l(l)*Math.cos(M(l)) + c4*2*M_l(l)*Math.cos(2*M(l)) + c5*3*M_l(l)*Math.cos(3*M(l));
}

function L_l(l){
	return M_l(l) + (C_l(l) * Math.PI / 180);
}

function J_l(l){
	return -1/360 + c8*M_l(l)*Math.cos(M(l)) - c9*2*L_l(l)*Math.cos(2*L(l));
}

function Delta_l(l){
	return U_l(l) / Math.sqrt(1 - Math.pow(U(l), 2));
}

function U(l){
	return c10 * Math.sin(L(l));
}

function U_l(l){
	return c1 * L_l(l) * Math.cos(L(l));
}

function W_l(l, phi){
	return -V_l(l, phi) / Math.sqrt(1 - Math.pow(V(l, phi), 2));
}

function V(l, phi){
	return (c11 - Math.sin(phi*Math.PI/180)*Math.sin(Delta(l))) / (Math.cos(phi*Math.PI/180)*Math.cos(Delta(l)));
}

function V_l(l, phi){
	return Delta_l(l) * (Math.cos(phi*Math.PI/180) * Math.cos(Delta(l)) * (-Math.sin(phi*Math.PI/180)) * Math.cos(Delta(l)) 
		+  (c11-Math.sin(phi*Math.PI/180)*Math.sin(Delta(l)))*Math.cos(phi*Math.PI/180)*Math.sin(Delta(l)))
	 / Math.pow(Math.cos(phi*Math.PI/180)*Math.cos(Delta(l)), 2);
}

function S_l(l, phi){
	return J_l(l) + W_l(l, phi) / 360;
}

function R_l(l, phi){
	return J_l(l) - W_l(l, phi) / 360;
}

function S_phi(l, phi){
	return W_phi(l, phi) / 360;
}

function R_phi(l, phi){
	return - W_phi(l, phi) / 360;
}

function W_phi(l, phi){
	return - V_phi(l, phi) / Math.sqrt(1 - Math.pow(V(l, phi), 2));
}

function V_phi(l, phi){
	return (c11 - Math.sin(phi*Math.PI/180)*Math.sin(Delta(l))) / Math.pow(Math.cos(phi*Math.PI/180)*Math.cos(Delta(l)), 2) * Math.sin(phi*Math.PI/180) - Math.cos(phi*Math.PI/180)*Math.sin(Delta(l));
}
