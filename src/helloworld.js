
var Block = React.createClass({

	render(){
		var style={
			width:"40px",
			height:"40px",
			float:"left",
			margin:"0",
			padding:"0"
		};
		if( this.props.block == 0 ){
			style.backgroundColor = "#000000"
		}else{
			style.backgroundColor = "#FF0000"
		}
		return <div style={style} >&nbsp;&nbsp;&nbsp;</div>
	}

});

var Row = React.createClass({
	render(){
		var style={
			clear:"both",
			margin:"0",
			padding:"0",
			border:"1px"
		};
		var blocks = this.props.row.map( function( block, idx ){
			var key = "b" + this.key + "-" + idx;
			return <Block block={block} key={key} />
		});
		return <div style={style}>{blocks}</div>
	}
});

var IntevalGen = {

	setIntevel( ms ){
		this.fixed_ms = ms;
		setTimeout( this.__onTimeout, this.fixed_ms );

	},
	__onTimeout(){
		this.onTimeout();
		setTimeout( this.__onTimeout, this.fixed_ms );
	},
	componentDidMount(){
		this.setIntevel(1000);
	}

};

var KeyEventer = {
	addKeyEvent( key, cb ){
		Mousetrap.bind( key, cb );
	},
	componentWillUnmount(){
		Mousetrap.reset();
	}
};

var BlockController = {
	getInitialState: function(){
		var ret = {
			currblock: null,
			currblockshape: 0, 
			currblockposition:{x : 0, y: 0},
			blocks: [
				[
					[
						[1],
						[1],
						[1],
						[1]
					],
					[
						[1,1,1,1]
					],
				],
				[
					[
						[1,1],
						[1,1]
					]
				],
				[
					[
						[1,1,0],
						[0,1,1]
					],
					[
						[0,1],
						[1,1],
						[1,0]
					]
				],
				[
					[
						[0,1,1],
						[1,1,0]
					],
					[
						[1,0],
						[1,1],
						[0,1]
					]
				],
				[
					[
						[0,1,0],
						[1,1,1]
					],
					[
						[1,0],
						[1,1],
						[1,0]
					],
					[
						[1,1,1],
						[0,1,0]
					],
					[
						[0,1],
						[1,1],
						[0,1]
					]
				],
				[
					[
						[1,1],
						[0,1],
						[0,1]
					],
					[
						[0,0,1],
						[1,1,1]
					],
					[
						[1,0],
						[1,0],
						[1,1]
					],
					[
						[1,1,1],
						[1,0,0]
					]
				],
				[
					[
						[1,1],
						[1,0],
						[1,0]
					],
					[
						[1,1,1],
						[0,0,1]
					],
					[
						[0,1],
						[0,1],
						[1,1]
					],
					[
						[1,0,0],
						[1,1,1]
					]
				]
			]
		};

		return ret;
	},
	hitCheck( currblock, c_x, c_y ){

		// board size check
		if( c_y >= this.state.row ) return false;
		if( c_x < 0 || c_x + currblock[0].length > this.state.col ) return false;

		// hit check
		for( var y = currblock.length - 1 ; y >= 0 ; -- y ){
			var block_y =  ( currblock.length - 1 ) - y;

			if(  c_y < block_y ) return true;

			for( var x = 0 ; x < currblock[0].length ; ++ x ){

				if( currblock[ y ][ x ] == 1 && 
					this.state.boardState[ c_y - block_y ][ c_x + x ] != 0 ){
					return false;
				}
			}
		}

		return true;

	},
	newBlock(){

		var currblock_idx = Math.ceil( ( Math.random() * 100 ) % ( this.state.blocks.length ) ) - 1;

		this.state.currblock = this.state.blocks[ currblock_idx ];
		this.state.currblockposition.x = parseInt( this.state.col /2 - this.state.currblock[0].length / 2 );
		this.state.currblockposition.y = -1;
		this.state.currblockshape = 0;
		
	},
	downBlock(){
		return this.moveBlock( 0, 1 );
	},
	shapeChange(){
		var currblock = this.state.currblock[this.state.currblockshape];
		var c_y = this.state.currblockposition.y;
		var c_x = this.state.currblockposition.x;

		// clean
		this.drawToBoard( 0 , currblock, c_x, c_y );

		// check
		if( !this.hitCheck( this.state.currblock[( this.state.currblockshape + 1 ) % this.state.currblock.length],
							c_x, c_y ) ) {
			this.drawToBoard( 1 , currblock, c_x, c_y );			
			return;
		}

		// Change shape
		this.state.currblockshape = ( this.state.currblockshape + 1 ) % this.state.currblock.length;

		currblock = this.state.currblock[this.state.currblockshape];
		this.drawToBoard( 1, currblock, c_x, c_y );

	},
	moveBlock( v_x, v_y ){
		var currblock = this.state.currblock[this.state.currblockshape];
		var c_y = this.state.currblockposition.y;
		var c_x = this.state.currblockposition.x;

		// check
		if( c_y + v_y >= this.state.row ) return false;
		if( c_x + v_x < 0 || c_x + v_x + currblock[0].length -1 >= this.state.col ) return false;

		// clean
		this.drawToBoard( 0 , currblock, c_x, c_y );

		if( !this.hitCheck( currblock, c_x + v_x, c_y + v_y ) ) {
			this.drawToBoard( 1 , currblock, c_x, c_y );			
			return false;
		}

		// draw
		c_y = this.state.currblockposition.y = c_y + v_y;
		c_x = this.state.currblockposition.x = c_x + v_x;

		this.drawToBoard( 1, currblock, c_x, c_y );

		return true;
	},
	drawToBoard( num, currblock, c_x, c_y ) {

		for( var y = currblock.length - 1 ; y >= 0 ; -- y ){
			var block_y =  ( currblock.length - 1 ) - y;

			if(  c_y < block_y ) break;

			for( var x = 0 ; x < currblock[0].length ; ++ x ){

				if( currblock[ y ][ x ] == 1 ){
					this.state.boardState[ c_y - block_y ][ c_x + x ] = num;
					
				}
			}
		}

	},
	checkGameOver(){
		var currblock = this.state.currblock[this.state.currblockshape];
		var c_y = this.state.currblockposition.y;

		// check
		if( c_y - currblock.length < 0 ) return true;
		else return false;
	},
	removeCompleteLine(){

		var score = 0;
		var y = this.state.row - 1;

		while( y >= 0 ){

			// check
			var isComplete = true;
			for( var x = 0 ; x < this.state.col; ++ x ){
				if( 0 == this.state.boardState[y][x] ){
					isComplete = false;
					break;
				}
			}

			// move down
			if( isComplete ){
				for( var mv_y = y -1 ; mv_y >= 0 ; -- mv_y ){
					this.state.boardState[mv_y + 1 ] = this.state.boardState[mv_y];
				}
				this.state.boardState[0] = new Array();
				for( var j = 0 ; j < this.state.col ; ++ j ){
					this.state.boardState[0].push( 0 );
				}
				++score ;
			}else{
				y = y - 1;
			}
		}

		return score;
	}
};


var Board = React.createClass( {
	
	mixins: [IntevalGen, KeyEventer, BlockController ],

	cleanBoard(){

		var boardState = new Array();
		for( var i = 0 ; i < this.state.row; ++ i ){
			boardState[i] = new Array();
			for( var j = 0 ; j < this.state.col ; ++ j ){
				boardState[i].push( 0 );
			}
		}

		this.setState( { boardState: boardState, count: 0 } );

	},
	getInitialState: function(){
		var ret = {
			count: 0,
			col: 10,
			row: 15
		};
		return ret;
	},
	componentWillMount(){

		// Add Key event
		this.addKeyEvent( "left", function( e, combo ){
			this.moveBlock( -1, 0 );
			this.setState( { boardState: this.state.boardState } );
		}.bind(this) );
		this.addKeyEvent( "right", function( e, combo ){
			this.moveBlock( 1, 0 );
			this.setState( { boardState: this.state.boardState } );
		}.bind(this));
		this.addKeyEvent( "up", function( e, combo ){
			this.shapeChange();
			this.setState( { boardState: this.state.boardState } );
		}.bind(this));
		this.addKeyEvent( "down", function( e, combo ){
			this.nextStep();
		}.bind(this));
		this.addKeyEvent( "space", function( e, combo ){
			this.gotoBottom();
		}.bind(this));

		// Clean board
		this.cleanBoard();

		// New block
		this.newBlock();

	},
	componentDidMount(){
	},
	componentWillUnmount(){
	},

	nextStep(){
		if( !this.downBlock() ){
			// Check End
			if( this.checkGameOver() ){
				alert("Game Over");
				this.cleanBoard();
			}else{
				var score = this.removeCompleteLine();
				if( 0 < score ){
					this.setState( { count: this.state.count + score } );
				}
				this.newBlock();
			}
		}
		this.setState( { boardState: this.state.boardState } );
	},
	gotoBottom(){
		while( this.downBlock() ){}

		// Check End
		if( this.checkGameOver() ){
			alert("Game Over");
			this.cleanBoard();
		}else{
			var score = this.removeCompleteLine();
			if( 0 < score ){
				this.setState( { count: this.state.count + score } );
			}
			this.newBlock();
		}
	
		this.setState( { boardState: this.state.boardState } );
	},

	onTimeout: function(){
		this.nextStep();
		
	},
	render: function(){
		
		var board = this.state.boardState.map( function( row, idx ){
			var key = "r" + idx;
			return <Row row={row} key={key}/>;
		});


		return( 
				<div className="contatiner" >
					<h1>
					{this.props.name} Tetris  Score : [ {this.state.count} ]
					</h1>
					<div>
						{board}
					</div>
				</div>
			);
	}
});

// keyDown


React.render(
  <Board name="React" />,
  document.getElementById('example')
);

// react tetris... ^^ 