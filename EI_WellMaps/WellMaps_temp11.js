/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var shaleplay_or = ee.FeatureCollection("ft:1EIjMHaQqs6SGoIdocVDIQJfFQXVwVKr4tbOgpy6c"),
    geometry3 = /* color: #000000 */ee.Geometry.Point([-119.70703125, 35.389049966911664]),
    geometry2 = /* color: #f1ff5d */ee.Geometry.Polygon(
        [[[-83.70339828250013, 42.36067223886009],
          [-83.7233965497606, 36.32649585463325],
          [-76.78826123344527, 37.67253509620034],
          [-73.95103498640799, 40.16127593903518],
          [-74.54237997262669, 42.90758581937808]]]),
    geometry1 = /* color: #98ff00 */ee.Geometry.MultiPoint(),
    GOM_offshore = ee.FeatureCollection("ft:1RkZEvZUCiE09ZyMOpkNBhjFik_VeZSAkCPqPK30S"),
    conventional_play = ee.FeatureCollection("ft:11jfMGryj5DdmBhG0GMP6ZcKWIK2oatWGUR1w9QUt"),
    GOM_boundary = ee.FeatureCollection("ft:1uOqEshx2FIgESMxBUB8IA0Mxxx2rbUlNcv6-cOS6"),
    Well = ee.FeatureCollection("ft:1Rto8ImdBnuDcBNX-ApGkuSfZf7UetvXjjFPc6RAu");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
Map.centerObject(geometry2, 5);//center on Geometry on the map


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
var shaleplay = shaleplay_or.union(); conventional_play= conventional_play.union(); var buffer_shaleplay = shaleplay.map(function(i){i=ee.Feature(i); return(i.buffer(ee.Number(1609).multiply(2)))});
var shaleplay_geometry = ee.Geometry(shaleplay.geometry());
var GOM_boundary_union = GOM_boundary.union()
var GOM_boundary_geometry= ee.Geometry(GOM_boundary_union.geometry());
Map.addLayer(conventional_play, {'color':red}, "conventional_play", 1, 0.2); Map.addLayer(shaleplay_or, {'color':black}, "shale play boundaries", 1, 0.5); // Map.addLayer(buffer_shaleplay,{'color':orange}, "shale play buffer", 1, 1)
// ################  wells in shale ################ //
var add_shale_label=  function(feature){
  feature = ee.Feature(feature);
  return(ee.Feature(feature)
  .set("shale_play", 0)
  );
};

var add_offshore_label=  function(feature){
  feature = ee.Feature(feature);
  return(ee.Feature(feature)
  .set("offshore", 0)
  );
};

var set_shale = function(feature){
  feature = ee.Feature(feature);
  var result = feature
  .set("shale_play", ee.Algorithms.If(feature.containedIn(shaleplay_geometry), 2,1 ))
  // .set("offshore", ee.Algorithms.If(feature.containedIn(GOM_boundary_geometry), 2,1));
  return (ee.Feature(result));
};

var set_offshore = function(feature){
  feature = ee.Feature(feature);
  var result = feature
  // .set("shale_play", ee.Algorithms.If(feature.containedIn(shaleplay_geometry), 2,1 ))
  .set("offshore", ee.Algorithms.If(feature.containedIn(GOM_boundary_geometry), 2,1));
  return (ee.Feature(result));
};
// print("hi");
// print(shaleplay_geometry);

var processed_wells = ee.FeatureCollection(Well)
.map(add_shale_label).map(set_shale)
.map(add_offshore_label).map(set_offshore);
// print(processed_wells.propertyNames())
// print(processed_wells.aggregate_sum('Well Count'));

Export.table.toDrive(ee.FeatureCollection(processed_wells), "labeled_active_wells_final");

// ################ filter Offshore from Directional/Unknown ################ 
var Active_GOM = GOM_offshore.filterMetadata('Status','equals', 'COM').filterMetadata('Type_Code','equals', 'D');
Map.addLayer(GOM_offshore, {'color':db}, "GOM_wells", 1, 1);Map.addLayer(Active_GOM, {'color':black}, "Active_GOM_wells", 1, 1);



//################ select wells of certaint attributes ################ //

var select = function( after,before, direction, type){
  // after= ee.String(after); before = ee.String(before);
  after = ee.Number.parse(after);before= ee.Number.parse(before);
  // after = ee.Number(after); before =ee.Number(before);
  direction = ee.String(direction);
  type= ee.List(type);  // print(before, after, direction, type, ee.Date(after).millis(), ee.Date(before).millis())
  var selected_fc = ee.FeatureCollection(processed_wells
  .filterMetadata('First Prod Year','greater_than', after)
  .filterMetadata('First Prod Year','not_greater_than', before)
  .filter(ee.Filter.inList('Drill Type',  [ee.String(direction)]))
  .filter(ee.Filter.inList('Updated Production Type',  type))); 
  return ee.FeatureCollection(selected_fc);
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
// print(Well_List);
var set_class = function(i, prev_well_list){
  i= ee.Number(i);
  prev_well_list = ee.List(prev_well_list);
  var element = ee.FeatureCollection(Well_List.get(i))
  var update = element.map(function(feature){
    feature = ee.Feature(feature);
    var results = feature.set("Class Label", Well_List_names.get(i));
    return(ee.Feature(results));
    })
  var newlabeled_Well_List = prev_well_list.set(i, ee.FeatureCollection(update));
  return(ee.List(newlabeled_Well_List));
};


var classified = ee.List.sequence(0, Well_List.size().subtract(1), 1)
.iterate(set_class, Well_List);

classified = ee.List(classified);
// print(classified);
// var x=0;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=1;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=2;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=3;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=4;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=5;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=6;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=7;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=8;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=9;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=10;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=11;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=12;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");
// var x=13;var toexport = ee.FeatureCollection(classified.get(x)); Export.table.toDrive(ee.FeatureCollection(toexport), ee.String(Well_List_names.get(x)).getInfo(), "EI_Well_Output_temp");









var i = 0; var j = 3; var k = 6;
Map.addLayer(ee.FeatureCollection(classified.get(i)), {'color':yellow}, Well_List_names.get(i).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(classified.get(j)), {'color':dg}, Well_List_names.get(j).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(classified.get(k)), {'color':pink}, Well_List_names.get(k).getInfo(), 1, 1); 


var collapse  = function(element , prev){
  prev = ee.FeatureCollection(prev);
  element = ee.FeatureCollection(element);
  return prev.merge(element);
};
var collapsed_classified = ee.List(classified).iterate(collapse, ee.FeatureCollection([]));
collapsed_classified = ee.FeatureCollection(collapsed_classified);
// print(ee.FeatureCollection(collapsed_classified).aggregate_sum('Well Count'));

// Export.table.toDrive(ee.FeatureCollection(collapsed_classified), "collapsed_classified_final");

var label = ee.FeatureCollection(collapsed_classified)
.select(['Class Label', 'shale_play', 'offshore', 'SerialNumber2'])
print(label.aggregate_count('shale_play'));
print(label.propertyNames());


Export.table.toDrive(label, "label"  )



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
// var well_count = function(fc){
//   fc = ee.FeatureCollection(fc);
//   var output = fc.aggregate_sum('Well Count');
//   return ee.Number(output);
// }; 
// // var count = Well_List.map(well_count); print('Total well count by type'); print(count);
// // var shale_well_FB_count = shale_well_FB.map(well_count);print('count of shale wellt/total well, by well type'); print(Well_List_names.zip(shale_well_FB_count).zip(count));
// // measured depth histogram, set graph options.
// var options = {title: 'measured depth',fontSize: 10,hAxis: {title: 'measured depth in ft'},vAxis: {title: 'well count'},series: {0: {color: 'blue'}}};
// var measured_depth = function(fc, series_name, geo){
//   fc = ee.List(fc);series_name = ee.List([series_name]);geo=ee.Geometry(geo);
//   var histogram = ui.Chart.feature.histogram(ee.FeatureCollection(fc.get(i)).filterBounds(geo), 
//     'Measured Depth (TD)',  30).setSeriesNames(series_name).setOptions(options); return(histogram);};
// // avg_depth
// var avg_depth = function(series_name, fc, geo){
//   fc = ee.List(fc); series_name = ee.String(series_name);geo=ee.Geometry(geo);
//   var roi = ee.FeatureCollection(fc.get(i))//.filterBounds(geo);
//   print(series_name, Well_List_names.get(i).getInfo()
//   // , roi.aggregate_count('Well Count')); 
//   // many rows have significant amount of wells within each entries
//   // such as Texas who reports in lease 
//   ,roi.aggregate_mean('Measured Depth (TD)')//, 'Mean Measured Depth'
//   ,roi.aggregate_count('Measured Depth (TD)')//, 'total count'
//   ,roi.aggregate_count_distinct('Measured Depth (TD)'));//, 'unique value');
//   return(ee.Number(0));
// };

// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(0)), {'color':red}, os_list_names.get(0).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(1)), {'color':yellow}, os_list_names.get(1).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(2)), {'color':dg}, os_list_names.get(2).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(3)), {'color':lb}, os_list_names.get(3).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(4)), {'color':db}, os_list_names.get(4).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(5)), {'color':pink}, os_list_names.get(5).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(6)), {'color':black}, os_list_names.get(6).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(7)), {'color':whi}, os_list_names.get(7).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(8)), {'color':orange}, os_list_names.get(8).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(9)), {'color':lorange}, os_list_names.get(9).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(10)), {'color':lyellow}, os_list_names.get(10).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(11)), {'color':lg}, os_list_names.get(11).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(12)), {'color':lp}, Well_List_names.get(12).getInfo(), 1, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(13)), {'color':azure}, Well_List_names.get(13).getInfo(), 1, 1); 


// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(0)), {'color':dg}, s_list_names.get(0).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(1)), {'color':red}, s_list_names.get(1).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(2)), {'color':yellow}, s_list_names.get(2).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(3)), {'color':dg}, s_list_names.get(3).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(4)), {'color':lb}, s_list_names.get(4).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(5)), {'color':db}, s_list_names.get(5).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(6)), {'color':pink}, s_list_names.get(6).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(7)), {'color':black}, s_list_names.get(7).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(8)), {'color':whi}, s_list_names.get(8).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(9)), {'color':orange}, s_list_names.get(9).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(10)), {'color':lorange}, s_list_names.get(10).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(11)), {'color':lyellow}, s_list_names.get(11).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(12)), {'color':azure}, s_list_names.get(12).getInfo(), 1, 0.5); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(13)), {'color':bl}, s_list_names.get(13).getInfo(), 1, 0.5); 

/*var collapse  = function(element , prev){
  prev = ee.FeatureCollection(prev);
  element = ee.FeatureCollection(element);
  return prev.merge(element);
};
var collapse_shale_well_FB = shale_well_FB.iterate(collapse, ee.FeatureCollection(shale_well_FB.get(0)) );
var collapse_all_well = Well_List.iterate(collapse, ee.FeatureCollection(Well_List.get(0)) )


Export.table.toDrive(collapse_shale_well_FB, "all_shale_wells")
Export.table.toDrive(collapse_all_well, "all_wells")

*/