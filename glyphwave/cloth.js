var render;
var Body;
var Composites;
var Bodies;
var World;
var world;
var engine;

// load symbols
var symbols = [
    './symbols2/sym0.png', 
    './symbols2/sym1.png', 
    './symbols2/sym2.png', 
    './symbols2/sym3.png', 
    './symbols2/sym4.png', 
    './symbols2/sym5.png', 
    './symbols2/sym6.png', 
    './symbols2/sym7.png', 
    './symbols2/sym8.png', 
    './symbols2/sym9.png',
    './symbols2/sym10.png', 
    './symbols2/sym11.png', 
    './symbols2/sym12.png', 
    './symbols2/sym13.png', 
    './symbols2/sym14.png', 
    './symbols2/sym15.png', 
    './symbols2/sym16.png', 
    './symbols2/sym17.png', 
    './symbols2/sym18.png', 
    './symbols2/sym19.png',
    './symbols2/sym20.png', 
    './symbols2/sym21.png', 
    './symbols2/sym22.png', 
    './symbols2/sym23.png', 
    './symbols2/sym24.png', 
    './symbols2/sym25.png', 
    './symbols2/sym26.png', 
    './symbols2/sym27.png', 
    './symbols2/sym28.png', 
    './symbols2/sym29.png',
    './symbols2/sym30.png', 
    './symbols2/sym31.png', 
    './symbols2/sym32.png'
];

function PopUp(){

}

function Start(){

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Events = Matter.Events;

    Body = Matter.Body;
    Composites = Matter.Composites;
    Bodies = Matter.Bodies;
    World = Matter.World;

    // create engine
    engine = Engine.create();
    world = engine.world;

    // create renderer
    render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: screen.width,
            height: screen.height,
            background: '#fbfbfb',
            wireframes: false,
            showDebug: false,
            showPositions: false,
            showShadows: false,
            showInternalEdges: false
        }
    });

    Render.run(render); 
    
    engine.world.gravity.y = -0.24;
    engine.world.gravity.x = -0.16;
    //engine.world.gravity.y = Math.random();
    //engine.world.gravity.x = Math.random();

    engine.world.bounds = {min: { x: 0, y: 0 }, max: { x: document.documentElement.clientWidth, y: document.documentElement.clientHeight}};

    // an example of using beforeUpdate event on an engine
    Events.on(engine, 'beforeUpdate', function(event) {
        var engine = event.source;
        var temp = 0;

        // apply random forces every 5 secs
        /*
        if (event.timestamp % 2400 < 50) {
            engine.world.gravity.x *=-1 ;
        } else */ if (event.timestamp % 2600 < 50) {
            engine.world.gravity.y *=-1 ;
        }

            /*
        if (event.timestamp % 2000 < 50) {
            engine.world.gravity.x = Math.random() * Math.sign(engine.world.gravity.x);
            engine.world.gravity.y = Math.random() * Math.sign(engine.world.gravity.y);
        } */


    });

    if (render.canvas) {
        render.canvas.width = document.documentElement.clientWidth;
        render.canvas.height = document.documentElement.clientHeight;
        SetupBodies();
    }

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.89,
                render: {
                    visible: false
                }
            }
        });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: document.documentElement.clientWidth
            , y: document.documentElement.clientHeight }
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

function Resize(){
    render.canvas.width = document.documentElement.clientWidth;
    render.canvas.height = document.documentElement.clientHeight;
    render.bounds = {min: { x: 0, y: 0 }, max: { x: render.canvas.width, y: render.canvas.height}}
    engine.world.bounds = {min: { x: 0, y: 0 }, max: { x: render.canvas.width, y: render.canvas.height}};
}

function SetupBodies(){
    // add bodies
    var num = 18 // Number of vertices per row

    var group = Body.nextGroup(true), 
        particleOptions = { friction: 0.0008, 
            collisionFilter: { group: group }, 
            render: { visible: true, 
                strokeStyle: '#000000', 
                //fillStyle: '#fafafa', 
                wireframes: false, 
                //lineWidth: 12
                }
            }
        constraintOptions = { stiffness: 0.015 , render: {visible: false}},
        cloth = Composites.softBody(document.documentElement.clientWidth/2, document.documentElement.clientHeight/2, num, num, 
            document.documentElement.clientWidth/num *0.5, document.documentElement.clientHeight/num *0.5, 
            false, 8, particleOptions, constraintOptions);

    var centrePoint =  (num * num / 2) - num/2
    //cloth.bodies[0].isStatic = true;
    //cloth.bodies[num - 1].isStatic = true;
    //cloth.bodies[num*(num - 1) - 1].isStatic = true;
    //cloth.bodies[num*num - 1].isStatic = true;
    cloth.bodies[0].render.visible = false;
    cloth.bodies[num - 1].render.visible = false;
    cloth.bodies[num*(num - 1) - 1].render.visible = false;
    cloth.bodies[num*num - 1].render.visible = false;

    
    for (var i = 12; i < num; i++) {
        cloth.bodies[i].isStatic = true;
        cloth.bodies[i].render.visible = false;
    }
    

        
    var counter = 0;
    
    for (var i=0;i<cloth.bodies.length; i++) {

        for (var i=0; i< cloth.bodies.length; i++) {
            var randInt = Math.round(Math.random() * (symbols.length -1));
            console.log(symbols[randInt]);
            cloth.bodies[i].render.sprite.texture = symbols[randInt];
        }

    }
   

    /*
    for (var i = 1; i < num*num;i+=num) {
        cloth.bodies[i-1].isStatic = true;
        cloth.bodies[i+num-1].isStatic = true;
    }
    */
    World.add(world, [
        cloth,
        //Bodies.circle(document.documentElement.clientWidth/2, document.documentElement.clientHeight/2, document.documentElement.clientHeight/9, { isStatic: true, render: {visible: false}}),
        //Bodies.circle(document.documentElement.clientWidth/4, document.documentElement.clientHeight/4, document.documentElement.clientHeight/12, { isStatic: true, render: {visible: false}}),
        //Bodies.circle(document.documentElement.clientWidth/4*3, document.documentElement.clientHeight/4, document.documentElement.clientHeight/12, { isStatic: true, render: {visible: false}}),
        
        //Bodies.rectangle(-80, -80, document.documentElement.clientWidth * 3, 80, { isStatic: true, render: {visible:false} }),
        //Bodies.rectangle(-80, document.documentElement.clientHeight, document.documentElement.clientWidth * 3, 80, { isStatic: true, render: {visible:false} }),
        //Bodies.rectangle(-80, -80, 80, document.documentElement.clientHeight * 3, { isStatic: true, render: {visible:false} }),
        //Bodies.rectangle(document.documentElement.clientWidth + 80, -80, 80, document.documentElement.clientHeight * 3, { isStatic: true, render: {visible:false} })
        //Bodies.rectangle(document.documentElement.clientWidth/2,0,80,document.documentElement.clientHeight*2, {isStatic:true})
        //Bodies.rectangle(400, 609, 800, 50, { isStatic: true })
    ]);
}

        /*
        switch (counter) {
            case 0:
                    cloth.bodies[i].render.texture='./pink.png';
                break;
            case 1:
                    cloth.bodies[i].render.texture='./cyan.png';
                break;
            case 2:
                    cloth.bodies[i].render.texture='./yel.png';
                break;
        }
        counter++;
        if (counter = 3) {
            counter = 0;
        }
         */