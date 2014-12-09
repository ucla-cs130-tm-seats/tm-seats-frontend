var resetSection = function() {
  if(zoomedTo != null) {
    zoomedTo.select('g').remove();
    zoomedTo.select('text').attr('display','block');
    zoomedTo.on('dblclick', displaySegment);
    zoomedTo.select('path').attr('class','section-path');
  }
  zoomedTo = null;
}
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

var zoomedTo = null;

var zoomLevels = [10240, 2560, 640];
var zoomLevel = 0;

var displaySegment = function() {
  if(zoomedTo != null && zoomedTo.node() == this) {
    return;
  }
  resetSection();
  zoomedTo = d3.select(this);
  if(zoomLevel == 0) {
    zoomLevel = 1;
    var bbox = zoomedTo.node().getBBox();
    zoom(bbox.x + bbox.width/2, bbox.y + bbox.height/2, zoomLevel);
  }
  //change the background to be white temporarily and hide text
  //display the seats
  $.ajax("event-data/0F004CFCCA844D21/0F004CFCCA844D21." + $(this).data('segment') + ".places.json", {
    "success": function(data, textStatus, jqXHR) {
      var g = zoomedTo.append('g').attr('class','seats');
      zoomedTo.select('text').attr('display','none');
      zoomedTo.select('path').attr('class','section-path-detail');
      $.each(data.places, function(i, place) {
        g.append('circle').attr('r',place.size/2).attr('cx',place.x).attr('cy',place.y).attr("class","seatdot");
      });
    },
    "error": function(data, textStatus, jqXHR) {
      resetSection();
    }
  });
};

var zoomIn = function(ele) {
  var coords;
  if(ele !== undefined && ele != null) {
    coords = d3.mouse(ele);
  } else {
    coords = d3.mouse(this);
  }
  zoomLevel = (zoomLevel + 1) % zoomLevels.length;
  if(zoomLevel == 0) {
    resetSection();
  }
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

  var viewBox = x + " " + y + " " + width + " " + height;
  d3.select(".seatmap-background").transition().duration(1000).attr("viewBox", viewBox);
  d3.select(".seatmap-foreground").transition().duration(1000).attr("viewBox", viewBox);
}


var panDrag = function(d, i) {
  var bboxs = d3.select('.seatmap-background').attr('viewBox').split(' ');
  var width = $('.seatmap').width();
  var height = $('.seatmap').height();
  var bbox = {
    'x': bboxs[0],
    'y': bboxs[1],
    'width': bboxs[2],
    'height': bboxs[3]
  };
  //convert the dx into viewport dx dy
  bbox.x -= d3.event.dx / width * bbox.width;
  bbox.y -= d3.event.dy / height * bbox.height;
  var viewBox = bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height;
  d3.select(".seatmap-background").attr("viewBox", viewBox);
  d3.select(".seatmap-foreground").attr("viewBox", viewBox);
}

var pan = d3.behavior.drag().on('drag', panDrag);

var unzoom = function() {
  //remove the seats
  //change back to normal background
  resetSection();
  zoom(0);
}

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
  $.ajax("event-data/0F004CFCCA844D21/0F004CFCCA844D21.availabilitySummary.json", {
    "success": function(data, textStatus, jqXHR) {
      avail = {}
      $.each(data.segments, function(i, seg) {
        avail[seg.segmentId] = { "avail": seg.placesAvailable, "total": seg.placesTotal };
      });
      $.ajax("event-data/0F004CFCCA844D21/0F004CFCCA844D21.geometry.json", {
        "success": function(data, textStatus, jqXHR) {
          aa = d3.select(".seatmap").append("svg").dblTap(zoomIn).on('dblclick', zoomIn).call(pan).attr("class","seatmap-foreground").attr("viewBox","0 0 10240 7680").attr("width","100%").append("g");
          $.each(data.shapes, function(i, ele) {
            label = ele.labels[0]
            aaa = aa.append("g").attr("class","section").attr('data-label',label.text).attr('data-segment',ele.segmentId).on('click', displaySegment);
            path = aaa.append("path").attr("d",ele.path).attr("stroke","darkgrey").attr("stroke-width",2).attr("fill",availToColor(avail[ele.segmentId].avail/avail[ele.segmentId].total)).attr("class","section-path");
          if (label.size == 0) {
            label.size = 150;
          }
          aaa.append("text").attr("x",label.x).attr("y",label.y+label.size).attr("text-anchor","start").attr("font-size",label.size).attr("font-family","Arial Bold, sans-serif").attr("fill","#ffffff").text(label.text);
          });
        }
      });
    }
  });
});

