var Stat = G2.Stat;
var Frame = G2.Frame;

//set chart area
var chart = new G2.Chart({
  id: 'c1',
  width: 750,
  height: 550,
  plotCfg: {
    margin: [0,100,20,100]
  }
});

var chartBottom = new G2.Chart({
  id: 'c2',
  width: 800,
  height: 200,
  plotCfg: {
    margin: [10,50,0,50]
  }
});

// global variables;
var plotData = [];
var plotDataframe =[];
var plotDataset;
var mapData;
var timer;
var n = 0;
var titleYear = 2009;

axios.get('https://gist.githubusercontent.com/YunS-Stacy/c2965a3fb7f36b54dadeac28086bdd92/raw/e1c8c475f8888beca1ec4c9a452252e0359b9cc4/crimeYear.geo.json')
.then(function(response){
  // get response, set cols
  var mapData = response.data;
  _.each(mapData.features, function(datum){
    plotData.push({
      name: datum.properties.name,
      crimedate: datum.properties.crimedate,
      crimenumber: datum.properties.crimenumber
    });
  });

  // set filter, separate dataset by year
  plotDataset = new Frame(plotData);
  _.each([2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016], function(datum){
    plotDataframe.push(Frame.filter(plotDataset, function(obj){
      return obj.crimedate == datum;
    }))
  });

  // set source defs
  chart.source(plotDataframe[0],{
    crimenumber:{
      alias: 'Crime Number',
      min: 0,
      max: 3500
    },
    crimedate:{
      alias: 'Year',
    }
  });

  //set legend offset
  chart.legend({
    dx:-100,
    dy:-50
  })

  // create Chart
  chart.polygon()
  .position(Stat.map.region('name', mapData))
  .tooltip('crimedate*crimenumber')
  .color('crimenumber');

  chartBottom.source(plotDataframe[0],{
    crimenumber:{
      alias: 'Crime Number',
      min: 0,
      max: 3500
    },
    crimedate:{
      alias: 'Year',
    }
  });
  chartBottom.axis('crimenumber',{
    line: null,
    tickLine: null,
    grid: null,
    title: null,
    labels: null
  });
  chartBottom.legend(false);

  chartBottom.point()
  .position('name*crimenumber')
  .size('crimenumber',30,1)
  .color('crimenumber','blue-pink')
  .shape('circle')
  .opacity('crimenumber')


  // first render
  chart.render();
  chartBottom.render()

  // listen to the events
  $('#begin').on('click', function(){
    $('#stop').on('click', function(){
      clearInterval(timer);
    });
    timer = setInterval(function(){
      if(n < 7){
        n +=1;
        titleYear += 1;
      } else {
        n = 0;
        titleYear = 2009;
      };
      chart.changeData(plotDataframe[n]);
      chartBottom.changeData(plotDataframe[n])

      $('#title').html('Year: ' + titleYear);

    },1500);
  });
});
