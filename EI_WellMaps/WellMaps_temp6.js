/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var Well = ee.FeatureCollection("ft:1Rto8ImdBnuDcBNX-ApGkuSfZf7UetvXjjFPc6RAu"),
    shaleplay_or = ee.FeatureCollection("ft:1EIjMHaQqs6SGoIdocVDIQJfFQXVwVKr4tbOgpy6c"),
    geometry3 = /* color: #000000 */ee.Geometry.Point([-119.70703125, 35.389049966911664]),
    geometry2 = /* color: #f1ff5d */ee.Geometry.Polygon(
        [[[-83.70339828250013, 42.36067223886009],
          [-83.7233965497606, 36.32649585463325],
          [-76.78826123344527, 37.67253509620034],
          [-73.95103498640799, 40.16127593903518],
          [-74.54237997262669, 42.90758581937808]]]),
    geometry1 = /* color: #98ff00 */ee.Geometry.Polygon(
        [[[-105.18310546875, 34.27083595165],
          [-104.96337890625, 30.581179257386985],
          [-99.84375, 30.12612436422458],
          [-100.17333984375, 33.94335994657882]]]),
    GOM_offshore = ee.FeatureCollection("ft:1RkZEvZUCiE09ZyMOpkNBhjFik_VeZSAkCPqPK30S"),
    conventional_play = ee.FeatureCollection("ft:11jfMGryj5DdmBhG0GMP6ZcKWIK2oatWGUR1w9QUt"),
    GOM_boundary = ee.FeatureCollection("ft:1uOqEshx2FIgESMxBUB8IA0Mxxx2rbUlNcv6-cOS6");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
Map.centerObject(geometry3, 9);//center on Geometry on the map
/* ################ Color scheme################ */  
  var db= ('0000FF').toString();var bl = ('#538dd6').toString();var lb= ('#86abff').toString();
  var azure= ('#11ffff').toString();
  var red=('ff510f').toString();var lr = ('#ff8f7d').toString();
  var gr= ('#4cff62').toString();var lg = ('#afff14').toString();var dg= ('#196e0a').toString();
  var yellow=('#ffeb00').toString();var lyellow = ('#fffcb0').toString();
  var whi=('#f7f7f7').toString();var black = ('#101010').toString();
  var pink = ('#ff6ad8').toString();var lp = ('#ffb9ec').toString();
  var orange = ('#ff9d24').toString();var lorange = ('#ffcc99').toString();
/* ################################################ */
print(Well.aggregate_sum("Well Count"));

var shaleplay = shaleplay_or.union(); conventional_play= conventional_play.union(); //var buffer_shaleplay = shaleplay.map(function(i){i=ee.Feature(i); return(i.buffer(ee.Number(1609).multiply(2)))});
Map.addLayer(conventional_play, {'color':red}, "conventional_play", 1, 0.2); 
Map.addLayer(shaleplay_or, {'color':black}, "shale play boundaries", 1, 0.5); // Map.addLayer(buffer_shaleplay,{'color':orange}, "shale play buffer", 1, 1)
// ################ select wells of certaint atrributes ################ //
var select = function( after,before, direction, type){
  after = ee.String(after).cat('-01-01');
  before= ee.String(before).cat('-01-01');
  direction = ee.String(direction);
  type= ee.List(type);  // print(before, after, direction, type, ee.Date(after).millis(), ee.Date(before).millis())
  var selected_fc = ee.FeatureCollection(Well
  .filterMetadata('First Prod Date','not_equals',null)
  .filterMetadata('First Prod Date','greater_than', ee.Date(after).millis())
  .filterMetadata('First Prod Date','not_greater_than', ee.Date(before).millis())
  .filter(ee.Filter.inList('Drill Type',  [ee.String(direction)]))
  .filter(ee.Filter.inList('Updated Production Type',  type))); 
  return selected_fc;
};
var Well_List = ee.List([
  select('2003','2100', 'H', ['GAS'] ),
  select('2000','2003', 'H', ['GAS'] ),
  select('1800','2000', 'H', ['GAS'] ),

  select('2007','2100', 'H', ['OIL'] ),
  select('2000','2007', 'H', ['OIL'] ),
  select('1800','2000', 'H', ['OIL'] ),
  
  
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
  'H_gas_00to03',
  'H_gas_pre2000', 
  
  'H_oil_post2007',
  'H_oil_00to07',
  'H_oil_pre2000',
  
  'H_OG_post2003',
  'H_OG_pre2003', 
  
  'U_post2000', 
  'U_pre2000',
  
  'D_wells_post2000',
  'D_wells_pre2000',
  
  'V_wells_post2000',
  'V_wells_pre2000']);
var os_list_names = Well_List_names.map(function(i){i = ee.String(i);return(i.cat('non_shale').toLowerCase());});var s_list_names = Well_List_names.map(function(i){i = ee.String(i);return(i.cat('_shale').toLowerCase());});var all_list_names = Well_List_names.map(function(i){i = ee.String(i);return(i.toUpperCase());});

// Map.addLayer(Well.filterMetadata('First Prod Date','not_equals',null), {'color':black}, "well", 1, 0.5); // Map.addLayer(buffer_shaleplay,{'color':orange}, "shale play buffer", 1, 1)
// Map.addLayer(Well.filterMetadata('First Prod Date','equals',null), {'color':pink}, "well", 1, 0.5); // Map.addLayer(buffer_shaleplay,{'color':orange}, "shale play buffer", 1, 1)


// print(Well.filterMetadata('SerialNumber1','equals',28492).getInfo());
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
var filter = ee.Filter.equals({
  leftField: 'system:index',
  rightField: 'system:index'
}); // tell the system how to match to two records 
var invertedJoin = ee.Join.inverted();// Define the join.
var outside_shale = function(i){
  i = ee.Number(i);
  var invertedJoined = invertedJoin.apply(Well_List.get(i), shale_well_FB.get(i), filter);
  return invertedJoined;
};// Apply the join.
var non_shale_well_FB = ee.List.sequence(0,Well_List.size().subtract(1),1).map(outside_shale);print(non_shale_well_FB);
// ################  Display results/ derive statistics #################//
// count number of wells
var well_count = function(fc){
  fc = ee.FeatureCollection(fc);
  var output = fc.aggregate_sum('Well Count');
  return ee.Number(output);
}; 
// var count = Well_List.map(well_count); print('Total well count by type'); print(count);
// var shale_well_FB_count = shale_well_FB.map(well_count);print('count of shale wellt/total well, by well type'); print(Well_List_names.zip(shale_well_FB_count).zip(count));
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

/*
var i=0; var geometry= geometry3;
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(i)), {'color':dg}, s_list_names.get(i).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(i)), {'color':azure}, os_list_names.get(i).getInfo(), 0, 1); 
// print(measured_depth(non_shale_well_FB, 'non_shale_well',geometry));
// print(measured_depth(shale_well_FB, 'shale_well',geometry));
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);

i=1;
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(i)), {'color':db}, s_list_names.get(i).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(i)), {'color':lb}, os_list_names.get(i).getInfo(), 0, 1); 
// print(measured_depth(non_shale_well_FB, 'non_shale_well',geometry));
// print(measured_depth(shale_well_FB, 'shale_well',geometry));
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);

i=2;
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);
i=3;
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);
i=4;
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);
i=5;
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);
i=6;
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);
i=7;
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);
i=8;
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);
i=9;
avg_depth('non_shale_well', non_shale_well_FB, geometry);
avg_depth('shale_well', shale_well_FB, geometry);




*/


// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(0)), {'color':red}, os_list_names.get(0).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(1)), {'color':yellow}, os_list_names.get(1).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(2)), {'color':dg}, os_list_names.get(2).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(3)), {'color':lb}, os_list_names.get(3).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(4)), {'color':db}, os_list_names.get(4).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(5)), {'color':pink}, os_list_names.get(5).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(6)), {'color':black}, os_list_names.get(6).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(7)), {'color':whi}, os_list_names.get(7).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(8)), {'color':orange}, os_list_names.get(8).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(9)), {'color':lorange}, os_list_names.get(9).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(10)), {'color':lyellow}, os_list_names.get(10).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(11)), {'color':lg}, os_list_names.get(11).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(12)), {'color':lp}, Well_List_names.get(12).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(13)), {'color':azure}, Well_List_names.get(13).getInfo(), 0, 1); 


// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(0)), {'color':dg}, s_list_names.get(0).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(1)), {'color':red}, s_list_names.get(1).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(2)), {'color':yellow}, s_list_names.get(2).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(3)), {'color':dg}, s_list_names.get(3).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(4)), {'color':lb}, s_list_names.get(4).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(5)), {'color':db}, s_list_names.get(5).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(6)), {'color':pink}, s_list_names.get(6).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(7)), {'color':black}, s_list_names.get(7).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(8)), {'color':whi}, s_list_names.get(8).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(9)), {'color':orange}, s_list_names.get(9).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(10)), {'color':lorange}, s_list_names.get(10).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(11)), {'color':lyellow}, s_list_names.get(11).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(12)), {'color':azure}, Well_List_names.get(12).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(13)), {'color':bl}, Well_List_names.get(13).getInfo(), 0, 1); 



// Map.addLayer(ee.FeatureCollection(Well_List.get(0)), {'color':dg}, Well_List_names.get(0).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(1)), {'color':red}, Well_List_names.get(1).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(2)), {'color':yellow}, Well_List_names.get(2).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(3)), {'color':dg}, Well_List_names.get(3).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(4)), {'color':lb}, Well_List_names.get(4).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(5)), {'color':db}, Well_List_names.get(5).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(6)), {'color':pink}, Well_List_names.get(6).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(7)), {'color':black}, Well_List_names.get(7).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(8)), {'color':whi}, Well_List_names.get(8).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(9)), {'color':orange}, Well_List_names.get(9).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(10)), {'color':lorange}, Well_List_names.get(10).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(11)), {'color':azure}, Well_List_names.get(11).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(12)), {'color':lp}, Well_List_names.get(12).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(Well_List.get(13)), {'color':lyellow}, Well_List_names.get(13).getInfo(), 0, 1); 


// https://groups.google.com/forum/#!searchin/google-earth-engine-developers/$20ui.chart%7Csort:relevance/google-earth-engine-developers/b5JzmsCXr9w/hDRtvxqgAQAJ Introducing the EE User Interface API




// ********* Number of wells in DI for offshore wells that matches number of active GOM 
// Map.addLayer(GOM_offshore, {'color':db}, "GOM_wells", 1, 1)
// Map.addLayer(Active_GOM, {'color':black}, "Active_GOM_wells", 1, 1)
// Map.addLayer(GOM_boundary, {'color':lb}, "GOEM_downloaded_GOM_boundary", 1, 1)
// Map.addLayer(ee.FeatureCollection(Well), {'color':dg}, "All DI wells", 0, 1); 
// Map.addLayer(GOM_offshore.geometry().convexHull(), {'color':yellow}, "Active_GOM_contour", 1, 1)

// There are different ways to compare the DI offshore and GOEM offshore: 1) filterbounds 2) spatial join 3) best join (by latitutde and longitude and distance)