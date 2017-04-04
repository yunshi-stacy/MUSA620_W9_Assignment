var Stat = G2.Stat;
var Frame = G2.Frame;

// global variables;
var plotData = [];
var plotDataframe =[];
var plotDataset;
var yearRange = ['2016','2015','2014','2013','2012','2011','2010','2009']
// var plotData;
var monthRange = ['01', '02', '03', '04', '05', '06', '07', '08','09','10','11', '12'];
var mapData;
var nX = 6;


var offX = 0.125;
var offY = 0.083;
$('#begin').on('click', function(){
  console.log('plot');
  plot();

})

var plot = function(){
  var year = yearRange[nX];
  console.log(year);
  // set chart area
  var chart = new G2.Chart({
    id: 'c1',
    width: 1200,
    height: 1800,
    plotCfg: {
      margin: [0,100,0,100]
    }
  });
  chart.tooltip(false);

  chart.source(plotDataset, {
    crimenumber:{
      alias: 'Crime Number',
      min: 0,
      max: 375
    },
    crimeyear:{
      type: 'cat',
      alias: 'Year',
      values: yearRange
    },
    crimemonth:{
      type: 'cat',
      alias: 'Month',
      values: monthRange
    }
  });
  chart.legend(false);

  var sql_statement = "SELECT * FROM crimemonth WHERE LEFT(crimemonth,4) = '" + year + "'";
  axios.get('https://yunshi-stacy.carto.com/api/v2/sql/?format=GeoJSON&q='+sql_statement)
  .then(function(response){
    // get response, set cols
    mapData = response.data;
    _.each(mapData.features, function(datum){
      plotData.push({
        name: datum.properties.name,
        crimemonth: datum.properties.crimemonth.substr(5,6),
        crimenumber: datum.properties.crimenumber,
        crimeyear: year
      });
    });

    // set filter, separate dataset by year
    plotDataset = new Frame(plotData);
    _.each(yearRange, function(year){
      // filter year
      var plotDatasetTempYear = Frame.filter(plotDataset, function(obj){
        return obj.crimeyear === year;
      });
      var nY =0;
      _.each(monthRange,function(n){
        var plotDatasetTempMonth = Frame.filter(plotDatasetTempYear, function(obj){
          return obj.crimemonth === n;
        });
        var view = chart.createView({
          start:{
            x: nX * offX,
            y: nY * offY
          },
          end:{
            x: (nX + 1) * offX,
            y: (nY + 1) * offY
          },
          animate: false,
          data: plotDatasetTempMonth
        });
        console.log(plotDatasetTempMonth.s())
        nY += 1;
        // view.source(plotDatasetTempMonth);

        view.polygon()
        .position(Stat.map.region('name', mapData))
        // .tooltip('crimeyear*crimemonth*crimenumber')
        .color('crimenumber');
      });
    })
    // first render
    chart.render();
    console.log(nX);
    nX += 1;
  });
};
