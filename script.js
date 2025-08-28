async function activateXR() {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const gl = canvas.getContext("webgl", {xrCompatible: true})


    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry(1,1,1);
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set (1, 0, 1);
    scene.add(cube);

    const camera = new THREE.PerspectiveCamera();
    camera.matrixAutoUpdate = false;
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true,
        canvas: canvas,
        context: gl
    });
    renderer.autoClear = false;
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer.domElement );

    // camera.position.z = 5;
    scene.add( cube );

    function animate() {
    renderer.render( scene, camera );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    }
    renderer.setAnimationLoop( animate );

    
    const session = await navigator.xr.requestSession("immersive-ar");
    session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, gl)
    });
    
    const referenceSpace = await session.requestReferenceSpace('local');
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Este trecho cria um loop para atualizar constantemente a perspectiva da câmera 

    const onXRFrame = (time, frame) => {
        session.requestAnimationFrame(onXRFrame);
        gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)
        const pose = frame.getViewerPose(referenceSpace);
        if (pose) {
            const view = pose.views[0];
            const viewport = session.renderState.baseLayer.getViewPort(view);
            renderer.setSize(viewport.width, viewport.height)

            camera.matrix.fromArray(view.transform.matrix)
            camera.projectionMatrix.fronArray(view.projectionMatrix);
            camera.updateMatrixWorld(true);

            renderer.render(scene, camera);
        }
    }
    session.requestAnimationFrame(onXRFrame);
}