var qt;
var pprices = {};
var jprices = {};

var apiurl = "http://tm-dev.glentaka.com:8000/ticketmaster";

d3.selection.prototype.dblTap = function(callback) {
  var last = 0;
  return this.each(function() {
    d3.select(this).on("touchstart", function(e) {
      if ((d3.event.timeStamp - last) < 200) {
        return callback(this, e);
      }
      last = d3.event.timeStamp;
    });
  });
}

var zoomLevels = [10240, 1280, 320];
var zoomLevel = 0;

var zoomIn = function(ele) {
  var coords;
  if(ele !== undefined && ele != null) {
    coords = d3.mouse(ele);
  } else {
    coords = d3.mouse(this);
  }
  zoomLevel = (zoomLevel + 1) % zoomLevels.length;
  zoom(coords[0], coords[1], zoomLevel);
}

var zoom = function(x, y, level) {
  if(level >= zoomLevels.length) {
    return;
  }
  var width = zoomLevels[level];
  x -= width / 2;
  var height = width * 3 / 4;
  y -= height / 2;

  x = Math.max(0, Math.min(10240-width, x));
  y = Math.max(0, Math.min(7680-height, y));
  var viewBox = x + " " + y + " " + width + " " + height;
  d3.select(".seatmap-background").transition().duration(1000).attr("viewBox", viewBox);
  d3.select(".seatmap-foreground").transition().duration(1000).attr("viewBox", viewBox);
  var bbox = {
    'x': x,
    'y': y,
    'width': width,
    'height': height
  };
  displaySections(bbox);
}

var oldSections;

var xhrs = {};

var resetSection = function(ele) {
  if(xhrs[$(ele).data('segment')] !== undefined && xhrs[$(ele).data('segment')] !== null) {
    xhrs[$(ele).data('segment')].abort();
    xhrs[$(ele).data('segment')] = null;
  }
  d3.select(ele).select('.seats').remove();
  d3.select(ele).select('text').attr('opacity','1');
  d3.select(ele).select('path').attr('opacity','1');
}

var seats = [];

var displaySection = function(ele) {
  if(xhrs[$(ele).data('segment')] !== undefined && xhrs[$(ele).data('segment')] !== null) {
    xhrs[$(ele).data('segment')].abort();
    xhrs[$(ele).data('segment')] = null;
  }
  xhrs[$(ele).data('segment')] = $.ajax(apiurl + "/checkAvailability/" , {
    "type": "POST",
    "data": {"segment": $(ele).data('segment')},
    "success": function(data, textStatus, jqXHR) {
      var avaibls = [];
      for(var i in data) {
        avaibls.push(data[i].fields.position);
      }
      xhrs[$(ele).data('segment')] = $.ajax(apiurl + "/get/place/" , {
        "type": "POST",
      "data": {"segment": $(ele).data('segment')},
      "success": function(data, textStatus, jqXHR) {
        var g = d3.select(ele).append('g').attr('class','seats');
        d3.select(ele).select('text').attr('opacity','0.3');
        d3.select(ele).select('path').attr('opacity','0.6');
        $.each(data.places, function(i, place) {
          var qqq = g.append('circle').attr('r',place.size/2).attr('cx',place.x).attr('cy',place.y).attr("class","seatdot-unavail").attr("data-seat",place.placeId);
          var zzz = function() {qqq.on("click", function() {
            d3.select(this).on("click",function() {
              updatePrice(-1 * pprices[$(this).parent().parent().data("segment")]);
              seats.splice($.inArray($(this).data('seat'),seats), 1);
              removeFromCart($(this).data('seat'));
              zzz();
            }).attr("class", "seatdot-mine");
            updatePrice(pprices[$(this).parent().parent().data("segment")]);
            seats.push($(this).data('seat'));
            addToCart($(this).data('seat'));
          }).attr("class", "seatdot-avail");
          };

          if($.inArray(place.placeId, seats) > -1) {
            qqq.on("click",function() {
              updatePrice(-1 * pprices[$(this).parent().parent().data("segment")]);
              seats.splice($.inArray($(this).data('seat'),seats), 1);
              removeFromCart($(this).data('seat'));
              zzz();
            }).attr("class", "seatdot-mine");
          } else if($.inArray(place.placeId, avaibls) > -1) {
            zzz();
          }
        });
        xhrs[$(ele).data('segment')] = null;
      },
      "error": function(data, textStatus, jqXHR) {
        resetSection(ele);
      }
      });
    }
  });
};

var displaySections = function(bbox) {
  //find which sections to unrender
  var newSections = [];
  if(zoomLevel > 0) {
    newSections = findSections(bbox.x, bbox.y, bbox.x + bbox.width, bbox.y + bbox.height);
  }
  var temp = $.extend(true, [], newSections);
  if(oldSections !== undefined && oldSections !== null) {
    //for every new section to display
    for(var i = 0; i < temp.length; i++) {
      //if it exists in the old sections, we don't have to re-render
      var i1 = $.inArray(temp[i], oldSections);
      var i2 = $.inArray(temp[i], newSections);
      if(i1 != -1) {
        oldSections.splice(i1,1);
        newSections.splice(i2,1);
      }
    }
    for(var i = 0; i < oldSections.length; i++) {
      resetSection(oldSections[i]);
    }
  }
  for(var i = 0; i < newSections.length; i++) {
    displaySection(newSections[i]);
  }
  oldSections = temp;
}

var filterByPrice = function() {
  var price = $('#eventPrices').val();
  var segs = jprices[price];
  var asdf = d3.selectAll(".section");
  for(var a in asdf[0]) {
    var seg = $(asdf[0][a]).data('segment');
    if(price == 0 || $.inArray(seg, segs) == -1) {
      d3.select(asdf[0][a]).select('path').attr("stroke","darkgrey").attr("stroke-width",2);
    } else {
      d3.select(asdf[0][a]).select('path').attr("stroke","yellow").attr("stroke-width",50);
    }
  }
}

var panDrag = function(d, i) {
  var bboxs = d3.select('.seatmap-background').attr('viewBox').split(' ');
  var width = $('.seatmap').width();
  var height = $('.seatmap').height();
  var bbox = {
    'x': bboxs[0],
    'y': bboxs[1],
    'width': parseInt(bboxs[2]),
    'height': parseInt(bboxs[3]),
  };
  //convert the dx into viewport dx dy
  bbox.x -= d3.event.dx / width * bbox.width;
  bbox.y -= d3.event.dy / height * bbox.height;
  bbox.x = Math.max(0, Math.min(10240-bbox.width, bbox.x));
  bbox.y = Math.max(0, Math.min(7680-bbox.height, bbox.y));
  var viewBox = bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height;
  d3.select(".seatmap-background").attr("viewBox", viewBox);
  d3.select(".seatmap-foreground").attr("viewBox", viewBox);
  displaySections(bbox);
}

var pan = d3.behavior.drag().on('drag', panDrag);

var findSections = function(x0, y0, x3, y3) {
  var potentials = [];
  qt.visit(function(node, x1, y1, x2, y2) {
    var p = node.point;
    if (p) {
      if($.inArray(p.section, potentials) == -1) {
        potentials.push(p.section);
      }
    }
    return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
  });
  return potentials;
};

var availToColor = function (avail) {
  if(avail == 0) {
    return "#999999";
  } else if (avail < 0.2) {
    return "#8FC8EC";
  } else if (avail < 0.5) {
    return "#0098E1";
  } else {
    return "#00477A";
  }
};


$(document).ready(function() {
  $.ajax(apiurl+"/0F004CFCCA844D21/summary/", {
    "success": function(data, textStatus, jqXHR) {
      avail = {}
      $.each(data, function(i, seg) {
        avail[seg.fields.segmentId] = { "avail": seg.fields.placesAvailable, "total": seg.fields.placesTotal };
      });
      $.ajax(apiurl+"/0F004CFCCA844D21/geometry/", {
        "success": function(data, textStatus, jqXHR) {
          aa = d3.select(".seatmap").append("svg").dblTap(zoomIn).on('dblclick', zoomIn).call(pan).attr("class","seatmap-foreground").attr("viewBox","0 0 10240 7680").attr("width","100%").append("g");
          var points = [];
          $.each(data.shapes, function(i, ele) {
            //load the things into a global quadTree
            label = ele.labels[0]
            aaa = aa.append("g").attr("class","section").attr('data-label',label.text).attr('data-segment',ele.segmentId);
            path = aaa.append("path").attr("d",ele.path).attr("stroke","darkgrey").attr("stroke-width",2).attr("fill",availToColor(avail[ele.segmentId].avail/avail[ele.segmentId].total)).attr("class","section-path");
            var bbox = path.node().getBBox();
            //heheheh we are cheating. (should use r-tree instead of quadtree)
            for(var i = 0; i <= 5; i++) {
              for(var j = 0; j <= 5; j++) {
                points.push({
                  'x': bbox.x + bbox.width * i / 5,
                  'y': bbox.y + bbox.height * j / 5,
                  'section': aaa.node(),
                });
              }
            }
            if (label.size == 0) {
              label.size = 150;
            }
            aaa.append("text").attr("x",label.x).attr("y",label.y+label.size).attr("text-anchor","start").attr("font-size",label.size).attr("font-family","Arial Bold, sans-serif").attr("fill","#ffffff").text(label.text);
          });
          qt = d3.geom.quadtree(points);
        }
      });
    }
  });
});

