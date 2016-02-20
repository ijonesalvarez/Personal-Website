
var canvas;
var gl;

var numTimesToSubdivide = 2;
var pointsArray = [];
var normalsArray = [];

var isFlat;
var isTheSun;
var rotateNow = true;

var length = 1.0;
var theta = 0.0;
var phi = -30.0;
var rot = 0.0;
var colorLoc;
var aspect = 1.0;
var fovy = 90;
var colorIndex = 0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

//var lightPosition = vec4(0.0, 9.0, 0.0, 0.0 );
var lightPosition = vec4(0.0, 0.0, 0.0, 0.0 );
var lightAmbient  = vec4(0.05, 0.05, 0.05, 1.0 );
var lightDiffuse  = vec4( 0.8, 0.8, 0.8, 1.0 );
var lightSpecular = vec4( 0.8, 0.8, 0.8, 1.0 );

var materialAmbient   = [
		vec4( 0.9, 0.7, 0.3, 1.0 ),
		vec4( 0.9, 0.9, 0.9, 1.0 ),
		vec4( 0.0, 0.5, 0.5, 1.0 ),
		vec4( 0.5, 0.5, 0.8, 1.0 ),
		vec4( 0.8, 0.9, 0.5, 1.0 ),
		vec4( 0.2, 0.2, 0.2, 1.0 ),
];

var materialDiffuse   = [
		vec4( 1.0, 0.5, 0.0, 1.0 ),
		vec4( 0.9, 0.9, 0.9, 1.0 ),
		vec4( 0.2, 0.9, 0.7, 1.0 ),
		vec4( 0.2, 0.2, 0.9, 1.0 ),
		vec4( 0.8, 0.3, 0.0, 1.0 ),
		vec4( 0.1, 0.1, 0.1, 1.0 ),		
];

var materialSpecular  = [
		vec4( 1.0, 0.5, 0.0, 1.0 ),
		vec4( 0.5, 0.5, 1.0, 1.0 ),
		vec4( 1.0, 0.5, 0.9, 1.0 ),
		vec4( 0.9, 0.9, 0.9, 1.0 ),
		vec4( 0.0, 0.0, 0.0, 1.0 ),
		vec4( 0.0, 0.0, 0.0, 1.0 ),
];

var materialShininess = [
		100.0, 40.0, 30.0, 80.0, 0.0,
];

var indexes = [
   0, 12, 60, 252, 1020, 4092,
];

var translateScene = vec3(0.0, -20.0, 40.0);
var xTrans = 0.0;
var zTrans = 0.0;
var displacement; 
var movePlanet = [
        vec3(  0.0,  0.0,  0.0 ),
        vec3(  6.0,  0.0, -6.0 ),
		vec3(  4.0, 0.0,  2.0 ),
		vec3(-10.7, 0.0, -6.0),
		vec3(-15.0, 0.0, 13.0),
		vec3(-15.0, 0.0, 13.0),
];

var scalePlanet = [
		vec3(1.0, 1.0, 1.0),
	    vec3(0.3, 0.3, 0.3),
		vec3(0.6, 0.6, 0.6),
		vec3(1.9, 1.9, 1.9),
		vec3(3.0, 3.0, 3.0),
		vec3(0.4, 0.4, 0.4),
];	

var moveMoon = vec3( 5.0, 0.0, 0.0);

var planetComplexity = [
		4, 2, 3, 5, 4, 3
];

var orbitSpeed = [ 2.5, 4.6, 7.0, 2.3, 0.7, 2.8 ]; 
var orbitLocation = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
var modelViewMatrix;
var viewMatrix;
var projectionMatrix;
var mView;

var eye = vec3(0.0, 0.0, 0.0);
var at  = vec3(0.0, 0.0, 1.0);
var up  = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c, i) {

	if (i == 1) {
		var t1 = subtract(b, a);
		var t2 = subtract(c, a);
		var normal = normalize(cross(t1, t2));
		normal = vec4(normal, 0.0);

		normalsArray.push(normal);
		normalsArray.push(normal);
		normalsArray.push(normal);
	} else {
		a = vec4(a, 0.0);
		b = vec4(b, 0.0);
		c = vec4(c, 0.0);
	    normalsArray.push(a);
		normalsArray.push(b);
		normalsArray.push(c);	
	}	
     
    pointsArray.push(a);
    pointsArray.push(b);      
    pointsArray.push(c);
}


function divideTriangle(a, b, c, count, i) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1, i );
        divideTriangle( ab, b, bc, count - 1, i );
        divideTriangle( bc, c, ac, count - 1, i );
        divideTriangle( ab, bc, ac, count - 1, i );
    }
    else { 
        triangle( a, b, c, i );
    }
}


function tetrahedron(a, b, c, d, n, i) {
    divideTriangle(a, b, c, n, i);
    divideTriangle(d, c, b, n, i);
    divideTriangle(a, d, b, n, i);
    divideTriangle(a, c, d, n, i);
}


window.onload = function init()
{

    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );	
	for(var i = 0; i < indexes.length; ++i)
	{
		tetrahedron(va, vb, vc, vd, i, i);
	}
	var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
	
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
	pMotionLoc = gl.getUniformLocation(program, "pMotion");
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	isSunLoc = gl.getUniformLocation( program, "isTheSun" );
	ambientProductLoc = gl.getUniformLocation( program, "ambientProduct"); 
	diffuseProductLoc = gl.getUniformLocation( program, "diffuseProduct");
	specularProductLoc = gl.getUniformLocation( program, "specularProduct");
	materialShininessLoc = gl.getUniformLocation( program, "materialShininess");
	isFlatLoc = gl.getUniformLocation(program, "isFlat")
	
	viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, 1, 200);
	orthoMatrix = ortho(-35.0, 35.0, -35.0, 35.0, -35.0, 35.0);
	
	
	window.onkeydown = function( event ) {
		switch (event.keyCode) {
			// Handles rotational camera movement
			case 38:
				phi -= 2.0;
				break;
			case 37:
				theta -= 2.0;
				break;
			case 39:
				theta += 2.0;
				break;
			case 40:
				phi += 2.0;
				break;
		}
	}
	
	window.onkeypress = function( event ) {
		var keyNum = event.keyCode;
    	var key = String.fromCharCode(keyNum);
        switch( key ) {
			// Changes the colors
			case 'c':
				colorIndex = (colorIndex + 1) % 8;
				break;
			// Narrower and Wider Views
			case 's':
				rotateNow = !rotateNow;
				break;
			// Handles camera movement
			case 'i':
				zTrans = -1.5;
				break;
			case 'j':
				xTrans = -1.5;
				break;
			case 'k':
				xTrans = 1.5;
				break;
			case 'm':
				zTrans = 1.5;
				break;
			case 'r':
				translateScene = vec3(0.0, -20.0, 40.0);
				phi = -30.0;
				theta = 0.0;
				break;
		}
	}
	
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    setInterval(render, 32);
}

function render()
{
	//console.log("Render is Called");
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	displacement = vec3( xTrans*Math.cos(radians(-theta)) + zTrans*Math.sin(radians(-theta)), 
	                     zTrans*Math.sin(radians(phi)),
                    	-xTrans*Math.sin(radians(-theta)) + zTrans*Math.cos(radians(-theta)));
	translateScene = add(translateScene, displacement);
	xTrans = 0.0;
	zTrans = 0.0;

	if (rotateNow) {
		for (var p = 0; p < orbitSpeed.length; ++p)
		{
			orbitLocation[p] += orbitSpeed[p];
			orbitLocation[p] = orbitLocation[p] % 360;
		}
	}
	for ( var i = 0; i < movePlanet.length; ++i ) {
	    // Translations and Rotation matrices to change the cube instance
		if (i == 0)
			isTheSun = true;
		else
			isTheSun = false;
		if (i == 1)
			isFlat = true;
		else	
			isFlat = false;
		gl.uniform1f(isFlatLoc, isFlat);
		gl.uniform1f(isSunLoc, isTheSun);
		mView = mat4();
		pMotion = mat4();
		//mView = mult(mView, projectionMatrix);
		mView = mult(mView, viewMatrix);
		mView = mult(mView, rotate(phi, [1,0,0]));
		mView = mult(mView, rotate(theta, [0,1,0]));
		mView = mult(mView, translate(translateScene));
		if (i == 5)
			mView = mult(mView, rotate(orbitLocation[i-1], [0,1,0]));
		else 
			mView = mult(mView, rotate(orbitLocation[i], [0,1,0]));
		
		pMotion = mult(pMotion, translate(movePlanet[i]));
		if (i == 5) {
			pMotion = mult(pMotion, rotate(orbitLocation[i], [0,1,0]));
			pMotion = mult(pMotion, translate(moveMoon));
		}
		pMotion = mult(pMotion, scale(scalePlanet[i]));
		//mView = mult(mView, rotate(rot, [0,1,0]));
		
		//gl.uniform4fv(colorLoc, flatten(cubeColors[(i+colorIndex)%8]));
		gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mView));
		gl.uniformMatrix4fv(pMotionLoc, false, flatten(pMotion));
		
		ambientProduct = mult(lightAmbient, materialAmbient[i]);
		diffuseProduct = mult(lightDiffuse, materialDiffuse[i]);
		specularProduct = mult(lightSpecular, materialSpecular[i]);
		
		gl.uniform4fv( ambientProductLoc, flatten(ambientProduct));
		gl.uniform4fv( diffuseProductLoc, flatten(diffuseProduct));
		gl.uniform4fv( specularProductLoc, flatten(specularProduct));	
		gl.uniform1f( materialShininessLoc, materialShininess[i] );
		
		for( var j=indexes[planetComplexity[i]-1]; j<indexes[planetComplexity[i]]; j+=3) 
			gl.drawArrays( gl.TRIANGLES, j, 3 );
	}
	
    //window.requestAnimFrame( render );
	//displacement = vec3(0.0, 0.0, 0.0);
}

