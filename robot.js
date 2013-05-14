function Coordinate(x, y)
{
    this.x = x;
    this.y = y;
}

function matrixToVector( row, col, numCol )
{
    return ((row * numCol) + col);
}

function vectorToMatrix( index, numCol )
{
    var col = index % numCol;
    var row = parseInt( index / numCol, 10 );

    return new Coordinate( col, row );
}

var Orientation = function() { };
Orientation.prototype =
{
    //Init
    initialize: function( startOrient )
    {
        this.orientations = ["N", "E", "S", "W"];

        //Index of current orientation
        var idx = this.orientations.indexOf( startOrient );
        if( idx >= 0 )
            this.orientIndex = idx;
        else
            this.orientIndex = 0;
    },

    //Increase the orientation
    increase: function()
    {
        this.orientIndex < this.orientations.length - 1 ? this.orientIndex++ : this.orientIndex = 0;
    },

    //Decrease the orientation
    decrease: function()
    {
        this.orientIndex > 0 ? this.orientIndex-- : this.orientIndex = this.orientations.length - 1;
    },

    //Get the next coordinate based on the current orientation
    getNextCoord: function( coord )
    {
        var nextCoord = new Coordinate( coord.x, coord.y );

        switch( this.orientations[this.orientIndex] )
        {
            case "N":
                nextCoord.y++;
                break;
            case "E":
                nextCoord.x++;
                break;
            case "S":
                nextCoord.y--;
                break;
            case "W":
                nextCoord.x--;
                break;
        }

        return nextCoord;
    },

    //Get Orientation
    getOrientation: function()
    {
        return this.orientations[this.orientIndex];
    }
};

var lostRobotPos = [];

function Robot( surfDimX, surfDimY, startCoord, startOrient )
{
    var surface = [];
    var numCol = 0, numRow = 0;

    this.isLost = false;

    //Assign the variables
    numCol = surfDimX;
    numRow = surfDimY;

    this.orientation = new Orientation();
    this.orientation.initialize(startOrient);
   
    //Create the vector wich represents the surface
    for( var i = 0; i < surfDimX * surfDimY; i++ )
    {
        surface[i] = "";
    }

    //Set the robot's position
    surface[matrixToVector( startCoord.y, startCoord.x, numCol )] = "X";


    //Move the robot to a new position
    this.move = move;
    function move()
    {
        var curCoord = vectorToMatrix( parseInt(surface.indexOf( "X" ), 10), parseInt(numCol, 10) );
        var newCoord = this.orientation.getNextCoord( curCoord );

        //Check the next robot coordinate
        if( newCoord.x >= numCol || newCoord.x < 0 ||
            newCoord.y >= numRow || newCoord.y < 0 )
        {
            //If the robot is out of the grid,
            //checks the "scent" of the previous robots
            if( lostRobotPos.indexOf( newCoord.toString() ) == -1 )
            {
                //No scent, robot lost
                lostRobotPos.push( newCoord.toString() );
                this.isLost = true;
            }
        }
        else
        {
            surface[matrixToVector( curCoord.y, curCoord.x, numCol )] = "";
            surface[matrixToVector( newCoord.y, newCoord.x, numCol )] = "X";
        }
    }

    //Get the coordinates of the robot
    this.getPosition = getPosition
    function getPosition()
    {
        return vectorToMatrix( surface.indexOf( "X" ), numCol );
    }
}

//Command object
function Command()
{
    var m_CmdList = [];

    this.initialization = initialization;
    function initialization()
    {
        m_CmdList["R"] = new TurnRightCmd();
        m_CmdList["L"] = new TurnLeftCmd();
        m_CmdList["F"] = new ForwardCmd();
    }

    this.exec = exec;
    function exec( cmdName, robot )
    {
        try
        {
            return m_CmdList[cmdName].execute( robot );
        }
        catch( err )
        {
            return false;
        }
    }
}

//Turn Right command
TurnRightCmd.prototype.execute = TurnRightCmd_Execute;
function TurnRightCmd() {}
function TurnRightCmd_Execute(robot)
{
    robot.orientation.increase();
    return true;
}

//Turn Left command
TurnLeftCmd.prototype.execute = TurnLeftCmd_Execute;
function TurnLeftCmd() {}
function TurnLeftCmd_Execute(robot)
{
    robot.orientation.decrease();
    return true;
}

//Forward command
ForwardCmd.prototype.execute = ForwardCmd_Execute;
function ForwardCmd() { }
function ForwardCmd_Execute( robot )
{
    robot.move();
    return true;
}

function start()
{
    //Parse the inputs
    var firstInput = document.getElementById( "robcoord" ).value; //Robot coordinate
    if( firstInput == "" )
    {
        alert( "Set robot coordinate" );
        return;
    }
    
    var dims = firstInput.split( " " );
    var gridX = 0;
    var gridY = 0;

    if( dims.length > 1 )
    {
        gridX = parseInt( dims[0], 10 ) + 1;
        gridY = parseInt( dims[1], 10 ) + 1;
    }

    if( gridX > 51 || gridY > 51 )
    {
        alert( "The max coordinate dimension is 50" );
        return;
    }

    var secondInput = document.getElementById( "robstartpos" ).value;   //Robot position and orientation
    if( secondInput == "" )
    {
        alert( "Set robot start position" );
        return;
    }

    var robPosX = 0, robPosY = 0; robPosOrient = "N";
    var robPosList = secondInput.split( " " );
    if( robPosList.length > 2 )
    {
        robPosX = parseInt( robPosList[0], 10 );
        robPosY = parseInt( robPosList[1], 10 );
        robPosOrient = robPosList[2];
    }
    if( robPosX > gridX || robPosX < 0 ||
        robPosY > gridY || robPosY < 0 )
    {
        alert( "Invalid start position" );
        return;
    }

    var thirdInput = document.getElementById( "robcommands" ).value;    //Commands
    if( thirdInput == "" )
    {
        alert( "Set robot commands" );
        return;
    }

    //Start execution
    //Instantiate the Command object
    var cmd = new Command();
    cmd.initialization();

    //Instantiate the Robot object
    var rob = new Robot( gridX, gridY, new Coordinate( robPosX, robPosY ), robPosOrient );

    //Loop the commands
    for( cmdInput in thirdInput )
    {
        if( cmd.exec( thirdInput[cmdInput], rob ) )
        {
            if( rob.isLost )
                break;
        }
    }

    //Set the output
    var strOutput = rob.getPosition().x + " " + rob.getPosition().y + " " + rob.orientation.getOrientation();
    if( rob.isLost )
    {
        strOutput += " LOST";
    }

    document.getElementById( "lbloutput" ).innerHTML = strOutput;
}