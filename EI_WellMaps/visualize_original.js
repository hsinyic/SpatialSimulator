/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var Well = ee.FeatureCollection("ft:1Rto8ImdBnuDcBNX-ApGkuSfZf7UetvXjjFPc6RAu"),
    shaleplay_or = ee.FeatureCollection("ft:1EIjMHaQqs6SGoIdocVDIQJfFQXVwVKr4tbOgpy6c"),
    GOM_offshore = ee.FeatureCollection("ft:1RkZEvZUCiE09ZyMOpkNBhjFik_VeZSAkCPqPK30S"),
    conventional_play_or = ee.FeatureCollection("ft:11jfMGryj5DdmBhG0GMP6ZcKWIK2oatWGUR1w9QUt"),
    GOM_boundary = ee.FeatureCollection("ft:1uOqEshx2FIgESMxBUB8IA0Mxxx2rbUlNcv6-cOS6"),
    county = ee.FeatureCollection("ft:1S4EB6319wWW2sWQDPhDvmSBIVrD3iEmCLYB7nMM");
/***** End of imports. If edited, may not auto-convert in the playground. *****/


/* ################ Color scheme################ */  
  var db= ('0000FF').toString();var bl = ('#538dd6').toString();var lb= ('#86abff').toString();
  var azure= ('#11ffff').toString();
  var red=('ff510f').toString();var lr = ('#ff8f7d').toString();
  var gr= ('#4cff62').toString();var lg = ('#afff14').toString();var dg= ('#196e0a').toString();
  var yellow=('#ffeb00').toString();var lyellow = ('#fffcb0').toString();
  var whi=('#f7f7f7').toString();var black = ('#101010').toString();
  var pink = ('#ff6ad8').toString();var lp = ('#ffb9ec').toString();
  var orange = ('#ff9d24').toString();var lorange = ('#ffcc99').toString();
  var purple1 = ('#430159').toString();
  var purple2 = ('#1b0159').toString();
  var br = ('#5b2e01').toString();
/* ################################################ */
var shaleplay = shaleplay_or.union().geometry(); 
var conventional_play= conventional_play_or; 
//var buffer_shaleplay = shaleplay.map(function(i){i=ee.Feature(i); return(i.buffer(ee.Number(1609).multiply(2)))});
Map.addLayer(conventional_play, {'color':red}, "conventional_play", 1, 0.2); 
Map.addLayer(shaleplay_or, {'color':black}, "shale play boundaries", 1, 0.5);  
Map.addLayer(county, {'color':gr}, "county", 1, 0.5);  


// Map.addLayer(buffer_shaleplay,{'color':orange}, "shale play buffer", 1, 1)
// ################ select wells of certaint atrributes ################ //
var no_date = Well
.filter(ee.Filter.inList('Updated Production Type', 
['GAS', 'OIL', 'BOTH']))
// .filter(ee.Filter.inList('Drill Type', 
// ['U']))
// .filterBounds(ee.Geometry(shaleplay))
.filterMetadata('SurfaceLongitude','equals', null)
// .filterMetadata('First Prod Date','equals', null);



print(no_date.aggregate_sum('Well Count'))



var no_date1 = Well
.filter(ee.Filter.inList('Updated Production Type', 
['GAS', 'OIL', 'BOTH']))
// .filter(ee.Filter.inList('Drill Type', 
// ['U']))
// .filterBounds(ee.Geometry(shaleplay))
// .filterMetadata('First Prod Date','not_equals', null);

print(no_date1.aggregate_sum('Well Count'))




var select = function( after,before, direction, type){
  // after = ee.Number.parse(after);before= ee.Number.parse(before);
  after =  ee.String(after);
  before = ee.String(before);
  after = ee.String(after).cat('-01-01');before= ee.String(before).cat('-01-01');
  direction = ee.String(direction);
  type= ee.List(type);  // print(before, after, direction, type, ee.Date(after).millis(), ee.Date(before).millis())
  var selected_fc = ee.FeatureCollection(Well
  .filterMetadata('First Prod Date','greater_than', ee.Date(after).millis())
  .filterMetadata('First Prod Date','not_greater_than', ee.Date(before).millis())
  // .filterMetadata('First Prod Year','greater_than', after)
  // .filterMetadata('First Prod Year','not_greater_than', before)
  .filter(ee.Filter.inList('Drill Type',  [ee.String(direction)]))
  .filter(ee.Filter.inList('Updated Production Type',  type))); 
  return selected_fc;
};
var Well_List = ee.List([
  select('2003','2100', 'H', ['GAS'] ),
  select('1800','2003', 'H', ['GAS'] ),

  select('2007','2100', 'H', ['OIL'] ),
  select('1800','2007', 'H', ['OIL'] ),
  
  select('2003','2100', 'H', ['BOTH'] ),
  select('1800','2003', 'H', ['BOTH'] ),

  select('2000', '2100', 'U', ['GAS', 'BOTH', 'OIL']),
  select('1800', '2000', 'U', ['GAS', 'BOTH', 'OIL']),

  select('2000', '2100', 'D', ['GAS', 'BOTH', 'OIL']),
  select('1800', '2000', 'D', ['GAS', 'BOTH', 'OIL']),


  select('2000', '2100', 'V', ['GAS', 'BOTH', 'OIL']),
  select('1800', '2000', 'V', ['GAS', 'BOTH', 'OIL'])
  ]);

var Well_List_names = ee.List([
  'H_gas_post2003',
  'H_gas_pre2003', 
  
  'H_oil_post2007',
  'H_oil_pre2007',
  
  'H_OG_post2003',
  'H_OG_pre2003', 
  
  'U_post2000', 
  'U_pre2000',
  
  'D_wells_post2000',
  'D_wells_pre2000',
  
  'V_wells_post2000',
  'V_wells_pre2000']);

var os_list_names = Well_List_names.map(function(i){i = ee.String(i);return(i.cat('non_shale').toLowerCase());});var s_list_names = Well_List_names.map(function(i){i = ee.String(i);return(i.cat('_shale').toLowerCase());});var all_list_names = Well_List_names.map(function(i){i = ee.String(i);return(i.toUpperCase());});

// ################ filter Offshore from Directional/Unknown ################ 
var Active_GOM = GOM_offshore.filterMetadata('Status','equals', 'COM').filterMetadata('Type_Code','equals', 'D')
var selectOnshore = function(i){
  i=ee.Number(i); 
  var offshore_wells = ee.FeatureCollection(Well_List.get(i)).filterBounds(GOM_boundary);
  var filter = ee.Filter.equals({leftField: 'system:index',rightField: 'system:index'}); var invertedJoin = ee.Join.inverted(); 
  var invertedJoined = invertedJoin.apply(Well_List.get(i), offshore_wells, filter);
  return invertedJoined;};//Map.addLayer(GOM_boundary, {'color':lb}, "GOEM_downloaded_GOM_boundary", 1, 1);
var No_Offshore = ee.List([Well_List_names.indexOf('D_wells_pre2000'),Well_List_names.indexOf('D_wells_post2000'),Well_List_names.indexOf('U_pre2000'),Well_List_names.indexOf('U_post2000'),]).map(selectOnshore);
No_Offshore =No_Offshore.reverse();
Well_List = Well_List.splice( Well_List_names.indexOf('U_post2000'),4,No_Offshore );
// ################  wells in shale ################ //
var in_shale = function(fc){
  fc = ee.FeatureCollection(fc);
  // var output = fc.filterBounds(buffer_shaleplay);
  var output = fc.filter(ee.Filter.bounds(shaleplay));
  return ee.FeatureCollection(output);
}; var shale_well_FB = Well_List.map(in_shale);
// ################ Inverted join to display wells not in shale #################//
// var filter = ee.Filter.equals({
//   leftField: 'system:index',
//   rightField: 'system:index'
// }); // tell the system how to match to two records 
// var invertedJoin = ee.Join.inverted();// Define the join.
// var outside_shale = function(i){
//   i = ee.Number(i);
//   var invertedJoined = invertedJoin.apply(Well_List.get(i), shale_well_FB.get(i), filter);
//   return invertedJoined;
// };// Apply the join.
// var non_shale_well_FB = ee.List.sequence(0,Well_List.size().subtract(1),1).map(outside_shale);print(non_shale_well_FB);
// ################  Display results/ derive statistics #################//
// count number of wells
var well_count = function(fc){
  fc = ee.FeatureCollection(fc);
  var output = fc.aggregate_sum('Well Count');
  return ee.Number(output);
}; 
var count = Well_List.map(well_count); print('Total well count by type'); print(count);
var shale_well_FB_count = shale_well_FB.map(well_count);print('count of shale wellt/total well, by well type'); print(Well_List_names.zip(shale_well_FB_count).zip(count));
// measured depth histogram, set graph options.
var options = {title: 'measured depth',fontSize: 10,hAxis: {title: 'measured depth in ft'},vAxis: {title: 'well count'},series: {0: {color: 'blue'}}};
var measured_depth = function(fc, series_name, geo){
  fc = ee.List(fc);series_name = ee.List([series_name]);geo=ee.Geometry(geo);
  var histogram = ui.Chart.feature.histogram(ee.FeatureCollection(fc.get(i)).filterBounds(geo), 
    'Measured Depth (TD)',  30).setSeriesNames(series_name).setOptions(options); return(histogram);};
// avg_depth
var avg_depth = function(series_name, fc, geo){
  fc = ee.List(fc); series_name = ee.String(series_name);geo=ee.Geometry(geo);
  var roi = ee.FeatureCollection(fc.get(i))//.filterBounds(geo);
  print(series_name, Well_List_names.get(i).getInfo()
  // , roi.aggregate_count('Well Count')); 
  // many rows have significant amount of wells within each entries
  // such as Texas who reports in lease 
  ,roi.aggregate_mean('Measured Depth (TD)')//, 'Mean Measured Depth'
  ,roi.aggregate_count('Measured Depth (TD)')//, 'total count'
  ,roi.aggregate_count_distinct('Measured Depth (TD)'));//, 'unique value');
  return(ee.Number(0));
};


Map.addLayer(ee.FeatureCollection(Well_List.get(0)), {'color':dg}, Well_List_names.get(0).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(1)), {'color':red}, Well_List_names.get(1).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(2)), {'color':yellow}, Well_List_names.get(2).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(3)), {'color':lp}, Well_List_names.get(3).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(4)), {'color':lb}, Well_List_names.get(4).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(5)), {'color':db}, Well_List_names.get(5).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(6)), {'color':pink}, Well_List_names.get(6).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(7)), {'color':purple1}, Well_List_names.get(7).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(8)), {'color':azure}, Well_List_names.get(8).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(9)), {'color':orange}, Well_List_names.get(9).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(10)), {'color':gr}, Well_List_names.get(10).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(11)), {'color':bl}, Well_List_names.get(11).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(12)), {'color':br}, Well_List_names.get(12).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(13)), {'color':purple2}, Well_List_names.get(13).getInfo(), 1, 1); 

var color_list = ee.List([dg, red, yellow, lp, lb, db, pink, purple1, azure, orange, gr,bl,   br, purple2])


Map.addLayer(conventional_play, {'color':red}, "conventional_play", 1, 0.2); 
Map.addLayer(shaleplay, {'color':black}, "shale play boundaries", 1, 0.5); // Map.addLayer(buffer_shaleplay,{'color':orange}, "shale play buffer", 1, 1)

var legend = ui.Panel({style: {position: 'bottom-left'}});
legend.add(ui.Label({
  value: "Well Class",
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0px'
  }
}));

var entry;
for (var x = 0; x<Well_List.size().getInfo(); x++){
  entry = [
    ui.Label({style:{color:color_list.get(x).getInfo(), margin: '0 0 4px 0'}, value: '██'}),
    ui.Label({
      value: Well_List_names.get(x).getInfo(),
      style: {
        margin: '0 0 4px 4px'
      }
    })
  ];
  legend.add(ui.Panel(entry, ui.Panel.Layout.Flow('horizontal')))
}

Map.add(legend);

