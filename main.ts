var myDiagram:go.Diagram;
var dataString:string;
var project:string;
var debugMode:boolean;

function unsavedChanges(value:boolean)
{
    if(value)
    {
        $("#unsavedChanges").show();
    }    
    else
    {
        $("#unsavedChanges").hide();
    }
}


function confirmModal(callback)
{  
    $('#modal-btn-si').on('click', function()
    {
        callback(true);
        $('#confirmModal').modal('hide');
    });

    $('#modal-btn-no').on('click', function()
    {
        callback(false);
        $('#confirmModal').modal('hide');
    });
};


async function init()
{    
    const urlParams = new URLSearchParams(window.location.search);
    project = urlParams.get('project');
    if(urlParams.get('debugMode')) debugMode = true;
    Details.init();
    load();

    var gojs = go.GraphObject.make;
    myDiagram = gojs(go.Diagram, "myDiagramDiv",
        {
            "toolManager.hoverDelay": 500,
            LayoutCompleted: function(e) 
            {
                //debugger;
                //var dia = e.diagram;
                // add height for horizontal scrollbar
                //dia.div.style.height = (dia.documentBounds.height + 24) + "px";
                //dia.div.style.width = (dia.documentBounds.width + 24) + "px";
            },
            contentAlignment: go.Spot.Center,
            "undoManager.isEnabled": true,
            "draggingTool.isGridSnapEnabled": true, 
            "commandHandler.canDeleteSelection": function()
            {
                $('#modal-btn-si').on('click', function()
                {
                    $('#confirmModal').modal('hide');
                    return go.CommandHandler.prototype.canDeleteSelection.call(myDiagram.commandHandler);                    
                });
            
                $('#modal-btn-no').on('click', function()
                {
                    $('#confirmModal').modal('hide');
                });
                $('#confirmModal').modal();
            },
            allowDrop:true,
            mouseDrop: function(e) 
            {                     
                if(e.diagram.selection.first().category=="Operation")
                    e.diagram.currentTool.doCancel();
            },
            layout: Util.getcurrentLayout()
        });

        myDiagram.addModelChangedListener(function(evt) 
        {
            if (evt.isTransactionFinished) 
            {
                var latestData = myDiagram.model.toJson();
                if(dataString != latestData)
                {
                    dataString = latestData;
                    unsavedChanges(true);
                }
                
                loadAPIs(dataString);
                loadSystems(dataString);
                loadEvents(dataString);
                updateDebug(dataString);
            }
        });
        //gojs(go.TextBlock, "Undo"),{ click: function(e, obj) { e.diagram.commandHandler.undo(); } },

        myDiagram.contextMenu = gojs(go.Adornment, "Vertical", 
            gojs("ContextMenuButton", gojs(go.TextBlock, "New API"),
                { 
                    click: function(e, obj) 
                    {
                        var diagram = e.diagram;
                        diagram.startTransaction('new API');
                        var data = 
                        {
                            category : "API",
                            isGroup : true,
                            name: "newAPI"
                        };
                        diagram.model.addNodeData(data);
                        var part = diagram.findPartForData(data);
                        part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                        diagram.commitTransaction('new API');
                        var txt = part.findObject("name");
                        diagram.commandHandler.editTextBlock(txt);
                    } 
                }),
            gojs("ContextMenuButton", gojs(go.TextBlock, "New Domain"),
                { 
                    click: function(e, obj) 
                    {
                        var diagram = e.diagram;
                        diagram.startTransaction('new Domain');
                        var data = 
                        {
                            category : "Domain",
                            isGroup : true,
                            name: "newDomain"
                        };
                        diagram.model.addNodeData(data);
                        var part = diagram.findPartForData(data);
                        part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                        diagram.commitTransaction('new Domain');
                        var txt = part.findObject("name");
                        diagram.commandHandler.editTextBlock(txt);
                    } 
                }),                
            gojs("ContextMenuButton", gojs(go.TextBlock, "New Event"),
                { 
                    click: function(e, obj) 
                    {
                        var diagram = e.diagram;
                        diagram.startTransaction('new event');
                        var data = 
                        {
                            category : "Event",
                            name: "newEvent"
                        };
                        diagram.model.addNodeData(data);
                        var part = diagram.findPartForData(data);
                        part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                        diagram.commitTransaction('new event');
                        var txt = part.findObject("name");
                        diagram.commandHandler.editTextBlock(txt);
                    } 
                }),
            gojs("ContextMenuButton", gojs(go.TextBlock, "New System"),
            { 
                click: function(e, obj) 
                {
                    var diagram = e.diagram;
                    diagram.startTransaction('new system');
                    var data = 
                    {
                        category : "System",
                        name: "newSystem"
                    };
                    diagram.model.addNodeData(data);
                    var part = diagram.findPartForData(data);
                    part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                    diagram.commitTransaction('new system');
                    var txt = part.findObject("name");
                    diagram.commandHandler.editTextBlock(txt);                                              
                } 
            })                        
            );

    myDiagram.groupTemplateMap.add("API", Template.apiTemplate());
    myDiagram.nodeTemplateMap.add("Operation", Template.operationTemplate());
    myDiagram.nodeTemplateMap.add("Event", Template.eventTemplate());
    myDiagram.groupTemplateMap.add("Domain", Template.domainTemplate());
    myDiagram.nodeTemplateMap.add("System", Template.systemTemplate());
    myDiagram.nodeTemplateMap.add("Event", Template.eventTemplate());
    myDiagram.linkTemplateMap.add("", Template.linkTemplate());
};

function getCategory(dataString, category)
{
    var data = JSON.parse(dataString);
    data.nodeDataArray = data.nodeDataArray.filter(function(node)
    {
        return node.category==category;
    });
    return data;
};

function includeOperation(key)
{
    var fullNode = myDiagram.findNodeForKey(key);

    myDiagram.startTransaction();
    myDiagram.nodes.each(function(node) 
    {
       if(node.data.key==key || (fullNode.containingGroup != null && node.data.key == fullNode.containingGroup.data.key))
       {
           node.visible = true;
       }
    });
    myDiagram.layout = Util.getcurrentLayout();;
    myDiagram.commitTransaction();
}

function includeAPI(key)
{
    myDiagram.startTransaction();
    myDiagram.nodes.each(function(node) 
    {
        if(node.data.key==key || node.data.group==key)
        {
            node.visible = true;
        }
    });
    myDiagram.layout = Util.getcurrentLayout();
    myDiagram.commitTransaction();    
}
function getInnerNodes(dataString, key)
{
    var data = JSON.parse(dataString).nodeDataArray.filter(function(node)
    {
        return node.group==key;
    });
    return data;
};

function createMenuItem(dataString, node)
{
    //var listItem = $("<li class='dropdown-submenu'/>");
    var a = $("<a class='dropdown-item' href='#' id='navbarDropdown' role='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" + node.name + "</a>").on("click", function() {includeOperation(node.key)});
    //listItem.append(a)
    return a;
}

function createOperationHTML(dataString, node)
{
    var listItem = $("<li class='dropdown-submenu'/>");
    var a = $("<a class='dropdown-item dropdown-toggle' href='#' id='navbarDropdown' role='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" + node.name + "</a>").on("click", function() {includeAPI(node.key)});
    var ul = $("<ul class='dropdown-menu' aria-labelledby='navbarDropdown'/>");

    getInnerNodes(dataString, node.key).forEach(function(operationNode)
    {
        var li = $("<li/>");
        var ia = $("<a class='dropdown-item' href='#'>" + operationNode.name + "</a>").on("click", function() {includeOperation(operationNode.key)});
        li.append(ia);
        ul.append(li);
    });

    listItem.append(a)
    listItem.append(ul);
    return listItem;
}

function loadAPIs(dataString)
{
    var divList = $("#APIList");
    divList.empty();

    var list = getCategory(dataString, "API").nodeDataArray;
    
    list.forEach(function(node) 
    {
        var api = createOperationHTML(dataString, node);
        divList.append(api);
    });        
};

function loadSystems(dataString)
{
    var divList = $("#SystemList");
    divList.empty();

    var list = getCategory(dataString, "System").nodeDataArray;
    list.forEach(function(node) 
    {
        var api = createMenuItem(dataString, node);
        divList.append(api);
    });        
};

function loadEvents(dataString)
{
    var divList = $("#EventList");
    divList.empty();

    var list = getCategory(dataString, "Event").nodeDataArray;
    list.forEach(function(node) 
    {
        var api = createMenuItem(dataString, node);
        divList.append(api);
    });        
};

async function save()
{
    Util.saveData(myDiagram.model.toJson());
    unsavedChanges(false);
    myDiagram.isModified = false;
}

async function load()
{
    var data = await Util.getData();
    if(data == null)
    {
        //myDiagram.model = new go.Model();
    }
    else
    {
        myDiagram.model = go.Model.fromJson(data);
    }
    dataString = data;
    unsavedChanges(false);
}

function generateImageLink(x)
{
    x.href = myDiagram.makeImage(
        {
            scale:5,
            maxSize :new go.Size(Infinity,Infinity)
        }
    ).src;
}

function updateDebug(dataString)
{
    if(debugMode)
        $("#dataDebugger").text(dataString);
}