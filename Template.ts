module Template
{
    function contextItemReferenceTo() : go.Adornment
    {
        var $ = go.GraphObject.make;
        return $("ContextMenuButton",$(go.TextBlock, "Include References To"), { click: function(e, obj)
        {
            var node:go.Node = e.diagram.findNodeForKey(obj.part.data.key);                            
            e.diagram.startTransaction();
            node.findNodesInto().each(function(n)
            {
                if(n.containingGroup!=null)
                    n.containingGroup.visible = true;

                n.visible = true;
            });
            e.diagram.layout = Util.getcurrentLayout();
            e.diagram.commitTransaction();
        }})
    }

    function contextItemReferenceFrom() : go.Adornment
    {
        var $ = go.GraphObject.make;
        return $("ContextMenuButton",$(go.TextBlock, "Include References From"), { click: function(e, obj)
        {
            var node:go.Node = e.diagram.findNodeForKey(obj.part.data.key);                            
            e.diagram.startTransaction();
            node.findNodesOutOf().each(function(n)
            {
                if(n.containingGroup!=null)
                    n.containingGroup.visible = true;
                
                n.visible = true;
            });
            e.diagram.layout = Util.getcurrentLayout();
            e.diagram.commitTransaction();
        }});
    }

    function contextMenuHide() : go.Adornment
    {
        var $ = go.GraphObject.make;
        return $("ContextMenuButton", $(go.TextBlock, "Hide"), { click: function(e, obj)
        {
            var node = e.diagram.findNodeForKey(obj.part.data.key);
            e.diagram.startTransaction();
            node.visible=false;
            e.diagram.commitTransaction();
        }
        });
    }

    function contextMenuFocus() : go.Adornment
    {
        var $ = go.GraphObject.make;
        return $("ContextMenuButton", $(go.TextBlock, "Focus"), { click: function(e, obj){Util.focus(e.diagram, obj.part.data.key)}});
    }

    export function apiTemplate()
    {
        var $ = go.GraphObject.make;
        return $(go.Group, "Vertical",
            {
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides,
                stretch: go.GraphObject.Fill,
                ungroupable: true,
                computesBoundsAfterDrag: true,
                computesBoundsIncludingLocation: true,
                mouseDragEnter: function(e, group, prev){group.isHighlighted = true;},
                mouseDragLeave: function(e, group, next){group.isHighlighted = false;},
                mouseDrop: function(e, group){group.addMembers(e.diagram.selection, true);},
                layout: $(go.LayeredDigraphLayout,
                {
                    setsPortSpots: true,
                    direction: 90
                }),
                contextMenu: $(go.Adornment, "Vertical", 
                    $("ContextMenuButton", $(go.TextBlock, "Focus"), 
                    {
                        click: function(e, obj){Util.focusOnAPI(e.diagram, obj.part.data.key)}
                    }),
                    $("ContextMenuButton", $(go.TextBlock, "New Operation"), 
                    { 
                        click: function(e, obj)
                        {
                            var diagram = e.diagram;
                            diagram.startTransaction('new Operation');
                            var data = 
                            {
                                category : "Operation",
                                group : obj.part.data.key,
                                name : "newOperation"
                            };
                            diagram.model.addNodeData(data);
                            var part = diagram.findPartForData(data);
                            part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                            diagram.commitTransaction('new Operation');
                            var txt = part.findObject("name");
                            diagram.commandHandler.editTextBlock(txt);                           
                        }
                    }),
                    contextMenuHide()
                    )},
                $(go.TextBlock,
                {
                    name:"name",
                    margin: 8,
                    maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    stroke: "#00a1de",
                    editable: true
                },
                new go.Binding("text", "name").makeTwoWay()
                ),
                $(go.Panel, "Auto",
                    $(go.Shape, "RoundedRectangle",
                    {
                        fill: "#00a1de",
                        strokeWidth: 0
                    }),
                    $(go.Placeholder,
                    {
                        padding: 20
                    })
            )
        );
    }

    export function domainTemplate()
    {
        var $ = go.GraphObject.make;

        return $(go.Group, "Vertical",
            {
                ungroupable: true
            },
            $(go.TextBlock,
                {
                    margin: 8,
                    maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    stroke: "#00a1de",
                    font: "bold 15px sans-serif"
                },
                new go.Binding("text", "name")),
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle",
                {
                    fill: "transparent",
                    strokeWidth: 2,
                    strokeDashArray: [4, 2],
                    stroke: "#00a1de"
                }),
                $(go.Placeholder,
                {
                    padding: 5
                })
            )
        );
    }

    export function eventTemplate()
    {
        var $ = go.GraphObject.make;

        return $(go.Node, "Vertical",
            {
                alignment: go.Spot.Center
            },
            $(go.Panel, "Auto",
                {
                    width: 50,
                    height: 50,
                    toolTip: $(go.Adornment, "Auto",
                        $(go.Shape,
                        {
                            fill: "#FFFFCC"
                        }),
                        $(go.TextBlock,
                            {
                                margin: 4
                            }, // the tooltip shows the result of calling nodeInfo(data)
                            new go.Binding("text", "Description"))
                    ),
                    contextMenu: $(go.Adornment, "Vertical", 
                        contextMenuFocus(),
                        contextMenuHide(),
                        contextItemReferenceFrom(),
                        contextItemReferenceTo())
                },
                $(go.Shape, "Hexagon",
                {
                    fill: "#0F6E00",
                    strokeWidth: 0,
                    portId: "",
                    cursor: "pointer", // the Shape is the port, not the whole Node
                    // allow all kinds of links from and to this port
                    fromLinkable: true,
                    toLinkable: true,
                    fromSpot: go.Spot.AllSides,
                    toSpot: go.Spot.AllSides
                })
            ),
            $(go.TextBlock,
                {
                    name:"name",
                    margin: 10,
                    //maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    textAlign: "center",
                    stroke: "#0F6E00",
                    editable: true
                },
                new go.Binding("text", "name").makeTwoWay()
            )
        );
    }

    export function integrationPointTemplate()
    {
        var $ = go.GraphObject.make;

        return $(go.Node, "Vertical",
            {
                alignment: go.Spot.Center
            },
            $(go.Panel, "Auto",
                {
                    width: 20,
                    height: 20,
                    toolTip: $(go.Adornment, "Auto",
                        $(go.Shape,
                        {
                            fill: "gray"
                        }),
                        $(go.TextBlock,
                            {
                                margin: 4
                            }, // the tooltip shows the result of calling nodeInfo(data)
                            new go.Binding("text", "Description"))
                    )
                },
                $(go.Shape, "Circle",
                {
                    fill: "orange",
                    strokeWidth: 0,
                    portId: "",
                    cursor: "pointer", // the Shape is the port, not the whole Node
                    fromLinkable: true,
                    toLinkable: true,
                    fromSpot: go.Spot.AllSides,
                    toSpot: go.Spot.AllSides,
                    alignment: go.Spot.Center
                })
            ),
            $(go.TextBlock,
                {
                    margin: 10,
                    //maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    textAlign: "center",
                    stroke: "orange",
                    editable: true
                },
                new go.Binding("text", "name").makeTwoWay()
            )
        );
    }

    export function linkTemplate()
    {
        var $ = go.GraphObject.make;

        return $(go.Link,
            {
                //routing:go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5
            // routing: go.Link.Orthogonal ,
                //layerName: "Foreground",
                //reshapable: true
                //toShortLength: 4
            },
            $(go.Shape,
            {
                stroke: "gray",
                strokeWidth: 1,
                toArrow: "Standard"
            }),
            $(go.Shape,
            {
                toArrow: "Standard",
                stroke: "gray",
                fill: "gray"
            })
            // $(go.TextBlock, "Calls", {segmentOffset: new go.Point(0,-10)})
        );
    }

    export function operationTemplate()
    {
        var $ = go.GraphObject.make;

        return $(go.Node, "Vertical",
            {
                alignment: go.Spot.Center
            },
            $(go.Panel, "Auto",
                {
                    width: 20,
                    height: 20,
                    toolTip: $(go.Adornment, "Auto",
                        $(go.Shape,
                        {
                            fill: "#FFFFCC"
                        }),
                        $(go.TextBlock,
                            {
                                margin: 4
                            }, // the tooltip shows the result of calling nodeInfo(data)
                            new go.Binding("text", "Description"))
                    ),
                    contextMenu: $(go.Adornment, "Vertical", 
                            contextMenuFocus(),
                            contextMenuHide(),
                            contextItemReferenceTo(),
                            contextItemReferenceFrom())
                },
                $(go.Shape, "Circle",
                {
                    fill: "#002776",
                    strokeWidth: 0,
                    portId: "",
                    cursor: "pointer", // the Shape is the port, not the whole Node
                    fromLinkable: true,
                    toLinkable: true,
                    fromSpot: go.Spot.AllSides,
                    toSpot: go.Spot.AllSides,
                    alignment: go.Spot.Center
                })
            ),

            $(go.TextBlock,
                {
                    name:"name",
                    margin: 10,
                    //maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    textAlign: "center",
                    stroke: "white",
                    editable: true
                },
                new go.Binding("text", "name").makeTwoWay()
            )
        );
    }

    export function systemTemplate()
    {
        var $ = go.GraphObject.make;

        return $(go.Node, "Auto",
            $(go.Panel, "Auto",
                {
                    width: 100,
                    height: 50,
                    contextMenu: $(go.Adornment, "Vertical",
                        contextMenuFocus(),
                        contextMenuHide(),
                        contextItemReferenceTo(),
                        contextItemReferenceFrom())
                },
                $(go.Shape, "Rectangle",
                {
                    //selectable: false, 
                    fill: "gray",
                    strokeWidth: 0,
                    portId: "",
                    cursor: "pointer",
                    fromSpot: go.Spot.AllSides,
                    toSpot: go.Spot.AllSides,
                    fromLinkable: true,
                    toLinkable: true
                }),
                $(go.TextBlock,
                    {
                        name:"name",
                        margin: 10,
                        //maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit,
                        stroke: "white",
                        editable: true
                    },
                    new go.Binding("text", "name").makeTwoWay()
                    )
                )
            );
    }
}