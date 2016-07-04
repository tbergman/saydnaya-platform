FA.LabelsView = function( app ) {

    var $dom,

        sceneWidth,
        sceneHeight,

        scope = this;


    init();


    function init() {

        $dom = $('#layer-labels');

        for ( var i = 0; i < app.rooms.length; i++ ) {
            $dom.append( app.rooms[ i ].$label );
        }

        addListeners();

    }


    function addListeners() {

        $dom
            .on( 'mouseenter', '.tag', onMouseenterLabel  )
            .on( 'mouseleave', '.tag', onMouseleaveLabel  )
            .on( 'mouseup', onMouseUp  )
            .on( 'mousedown', onMouseDown  );

    }


    function removeListeners() {

        $dom
            .off( 'mouseenter', '.tag', onMouseenterLabel  )
            .off( 'mouseleave', '.tag', onMouseleaveLabel  )
            .off( 'mouseup', onMouseUp  )
            .off( 'mousedown', onMouseDown  );

    }


    function onMouseenterLabel( e ) {

        var $label = $( e.target ).parent(),
            locationSlug = $label.data( 'id' );

        app.setOverLocation( locationSlug );

    }


    function onMouseleaveLabel( e ) {

        app.setOverLocation( null );

    }


    function onMouseUp( e ) {

        // re-enable labels
        $dom
            .on( 'mouseenter', '.tag', onMouseenterLabel  )
            .on( 'mouseleave', '.tag', onMouseleaveLabel  )

    }


    function onMouseDown( e ) {

        // disable labels
        $dom
            .off( 'mouseenter', '.tag', onMouseenterLabel  )
            .off( 'mouseleave', '.tag', onMouseleaveLabel  )

    }


    function toScreenXY( position, camera ) { //, jqdiv ) {

        var pos = position.clone().project( camera ); // NDC (-1.0 .. 1.0)
        return {
            x: ( pos.x + 1 ) * sceneWidth / 2,    //+ jqdiv.offset().left,
		    y: ( - pos.y + 1 ) * sceneHeight / 2,  //+ jqdiv.offset().top
            z: pos.z
        }

    }


    this.update = function( camera ) {

        var prisonMesh = app.buildingMesh,
            boundingSphereRadius = prisonMesh.geometry.boundingSphere.radius,
            buildingCenter = prisonMesh.position.clone(),
            rooms = app.rooms;

        // update all labels
        for ( var i = 0, max = rooms.length; i < max; i++ ) {

            var room = rooms[ i ],
                anchor = room.getCenter(),
                screenCoord = toScreenXY( anchor, camera ),

                distanceToAnchor = camera.position.distanceTo( anchor );
                distanceToCenter = camera.position.distanceTo( buildingCenter ),
                farZ = distanceToCenter + boundingSphereRadius,
                nearZ = distanceToCenter - boundingSphereRadius,
                pct = (distanceToAnchor - nearZ) / (farZ - nearZ);
                pct = 1 - pct;

            // opacity won't be affected by disatnce if this room is selected
            var opacity = ( room.getSlug() !== app.getActiveLocation() ) ? (0.1 + pct) : 0.8;
            opacity = ( room.getSlug() !== app.getOverLocation() ) ? opacity : 0.8;

            room.$label.css( {
                'transform' : 'translate3d(' + screenCoord.x  + 'px,' + screenCoord.y + 'px,0px)',
                'opacity' : opacity,
                'z-index' : Math.round(pct * 100)
            } );

        }

    }


    this.setOpacity = function( val ){

        $dom.css( 'opacity', ( val < 0.5 ) ? 1 : 0 );

    }


    this.setSize = function( width, height ) {

        sceneWidth = width;
        sceneHeight = height;

    }


    this.destroy = function() {

        removeListeners();

        $dom.empty();

    }
}