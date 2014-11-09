var displaySegment = function() {
  var seg = $(this).data('segment');
  var label = $(this).data('label');
  $.ajax("event-data/0F004CFCCA844D21/0F004CFCCA844D21."+seg+".pricing.json", {
    "success": function(data, textStatus, jqXHR) {
      $(".section-id").text(label);
      $(".price").text('$'+data.prices[0].faceValue);
      $(".available-seats").text(data);
    }
  }
  );
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
  $.ajax("event-data/0F004CFCCA844D21/0F004CFCCA844D21.availabilitySummary.json", {
    "success": function(data, textStatus, jqXHR) {
      avail = {}
      $.each(data.segments, function(i, seg) {
        avail[seg.segmentId] = { "avail": seg.placesAvailable, "total": seg.placesTotal };
      });
      $.ajax("event-data/0F004CFCCA844D21/0F004CFCCA844D21.geometry.json", {
        "success": function(data, textStatus, jqXHR) {
          aa = d3.select(".seatmap").append("g");
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

