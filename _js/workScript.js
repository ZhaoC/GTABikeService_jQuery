//declare variable to store bike info
var arrayItem = null;
var loadValue = 0;
var rate = 0;
var positionPoint = {
    "lat": 0,
    "lon": 0
};
var map;


//retrieve json file content
$(function()
{
    $.ajax(
    {
        type: "GET",
        url: "bikeshare.json",
        dataType: "json",
        success: Response,
        error: function()
        {
            alert("Application,json:Io problem");
        }
    });
});


//function to handle response
function Response(result)
{
    //retrieve data from json and store in the arrayItem    
    loadValue = 1;
    arrayItem = result.stationBeanList;
    totalAvialible = 0;
    totalDock = 0;
    availableDock = 0;



    for (var i = 0; i < arrayItem.length; i++)
    {
        totalAvialible += arrayItem[i].availableBikes;
        totalDock += arrayItem[i].totalDocks;
        availableDock += arrayItem[i].availableDocks;
    }
    rate = (totalAvialible / totalDock).toFixed(2) * 100; //get the percent of the available bike
    dockRate = (availableDock / totalDock).toFixed(2) * 100; //get the percentage of available dock

    //function to create the pie chart
    var $ppc = $('.progress-pie-chart'),
        deg = 360 * rate / 100;
    if (rate > 50)
    {
        $ppc.addClass('gt-50');
    }
    $('.ppc-progress-fill').css('transform', 'rotate(' + deg + 'deg)');
    $('.ppc-percents span').html(rate + '%');
    $('#chartTotalBike').html(totalDock);
    $('#chartAvaBikePercent').html(rate + "%");
    $('#chartAvaDockPercent').html(dockRate + "%");
    $('#chartAvaBike').html(totalAvialible);


    //Function to display report page
    $(document).on('pagebeforeshow', '#REPORT',
        function()
        {
            //reportContent will be used to store append text for report page
            var reportContent = null;
            for (var i = 0; i < arrayItem.length; i++)
            {
                //report code part
                reportContent += '<tr><td>' + arrayItem[i].id + '</td><td>' + arrayItem[i].stationName + '</td><td>' + arrayItem[i].availableDocks + '\/' + arrayItem[i].totalDocks + '</td><td>' + arrayItem[i].availableBikes + '</td><td>' + arrayItem[i].statusValue + '</td><td>' + arrayItem[i].statusKey + '</td><td>' + arrayItem[i].landMark + '</td><td>' + arrayItem[i].lastCommunicationTime + '</td><td>' + arrayItem[i].latitude + '\/' + arrayItem[i].longitude + '</td></tr>';
            }
            $('#reportContent').html(reportContent); //append content to the report page
            $('#currenAvailabilityRate').html('&nbsp &nbsp Current Availability Rate: ' + rate + '%');
            $('#reportTime').html(new Date()); //display the current time in page footer
            $('#reportContent').trigger('create'); //create page
            $("#myTable").table("refresh"); //refresh table
        }
    );


    //LOCATION
    //function to display the location page with list view
    var selectedIndex = 0;
    //set the page animation when direct to the bikeinfo page
    $(document).on('vclick', '#bike-list li a', function()
    {
        selectedIndex = $(this).attr('data-id'); //get the data-id of the bike clicked
        $.mobile.changePage("#bikePage",
        {
            transition: "fade",
            changeHash: false
        });
    });

    //retrive content and insert into the placeholder before the page showing
    $(document).on('pagebeforeshow', '#LOCATION',
        function()
        {
            var locationListview = "";
            $.each(arrayItem, function(i, row)
            {
                locationListview += '<li><a href="" data-id="' + i + '">' + row.stationName + '</a></li>';
            });
            $('#bike-list').html(locationListview);
            $('#bike-list').listview('refresh'); //refresh after append all the data to the 'bike-list'
            $('#locationFooter').html(new Date());
        }
    );

    //this is the sub-page of locationPage which display the info details of indvidual bike station
    $(document).on('pagebeforeshow', '#bikePage',
        function()
        {
            $('#bikeInfo').empty(); //clear the bike info page content
            /*Start append the content in json file */
            $('#bikeInfo').append('<H2>' + arrayItem[selectedIndex].stationName + '</H2>' +
                '<p>' + 'Available Docks: ' + arrayItem[selectedIndex].availableDocks +
                '<br>Total Docks: ' + arrayItem[selectedIndex].totalDocks +
                '<br>Status: ' + arrayItem[selectedIndex].statusValue +
                '<br>Available Bikes: ' + arrayItem[selectedIndex].availableBikes +
                '<br>Last Communication Time: ' + arrayItem[selectedIndex].lastCommunicationTime + '</p>');

            $('#bikeInfo').trigger('create'); //trigger create after done with the append command  
            $('#bikeInfoTime').html(new Date());
        }
    );


    //MAP page
    //display the bike station in google map
    var myOptions = {
        center: new google.maps.LatLng(43.656518, -79.389099), //Front St W / Blue Jays Way
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    //Funtion to create makers for point in google map
    function createMarker(lat, lng, title, content, map, icon)
    {
        console.log("Title", title);
        var point = new google.maps.LatLng(lat, lng);
        var marker = new google.maps.Marker(
        {
            position: point,
            icon: icon,
            map: map,
            title: title
        });
        var infowindow = new google.maps.InfoWindow(
        {
            content: content
        });
        google.maps.event.addListener(marker, 'click', function()
        {
            infowindow.open(map, marker); // Now we open the window
        });
    }
    //the main function for map create
    $(document).on('pageshow', '#MAP', function()
    {
        initialize();
        //google.maps.event.addDomListener(window, 'load', initialize);
        $('#MAP').trigger('create'); //create the map page 
        $('#mapTime').html(new Date());
        /* if (loadValue == 1)
        {
            location.reload();
        } */
    });

    function initialize()
    {
        // Set up map as detailed map of The bike location
        map = new google.maps.Map(document.getElementById("mapArea"),
            myOptions);

        // Set up an array of all the information relating to the individual bike locations. 
        var bikelocations = [];
        for (var i = 0; i < arrayItem.length; i++)
        {
            bikelocations.push(
            {
                lat: arrayItem[i].latitude,
                lng: arrayItem[i].longitude,
                name: arrayItem[i].stationName,
                comment: "Avaliable Bikes: " + arrayItem[i].availableBikes
            });
        }
        // Iterate through array calling create Marker
        for (var i = 0; i < bikelocations.length; i++)
        {
            createMarker(bikelocations[i].lat, bikelocations[i].lng, bikelocations[i].name,
                bikelocations[i].comment, map, "images/bikeicon.png");
        }
    }

    //Botton used to get user curretn location
    $(document).on('click', '#locButton', function()
    {
        getCurrentPosition();

        if (positionPoint.lat !== 0)
        {
            console.log("Point", positionPoint.lat, positionPoint.lon);

            //start the distance compare process
            var distanceValue = new Array();
            for (var i = 0; i < arrayItem.length; i++)
            {
                var des_lat = arrayItem[i].latitude;
                var des_lng = arrayItem[i].longitude;
                var distance = getDistance(positionPoint.lat, positionPoint.lon, des_lat, des_lng);
                distanceValue.push(
                {
                    "id": arrayItem[i].id,
                    "dis": distance
                });
            }

            distanceValue = insertionSort(distanceValue);
            for (var i = 0; i < distanceValue.length; i++)
            {
                console.log(distanceValue[i].id, distanceValue[i].dis);
            }


            //Drop marker at current location
            createMarker(positionPoint.lat, positionPoint.lon, "Current Location", "You are here.", map, "");
            map.setCenter(new google.maps.LatLng(positionPoint.lat, positionPoint.lon));
            map.setZoom(11);


            //Drop marker at the five nearest location
            for (var i = 0; i < 5; i++)
            {
                for (var j = 0; j < arrayItem.length; j++)
                {
                    if (arrayItem[j].id == distanceValue[i].id)
                    {
                        var index = new Array();
                        index[0] = "first";
                        index[1] = "second";
                        index[2] = "third";
                        index[3] = "fourth";
                        index[4] = "fifth";
                        createMarker(arrayItem[j].latitude, arrayItem[j].longitude,
                            "The " + index[i] + " nearest: " + arrayItem[j].stationName + " (click for more...)",
                            "Available: " + arrayItem[j].availableBikes + " bikes & " + arrayItem[j].availableDocks + " docks",
                            map,
                            "images/bikeiconblue.jpg");
                        break;
                    }
                }
            }

        }

    });




    //Haversine Formula
    function rad(x)
    {
        return x * Math.PI / 180;
    }

    function getDistance(p1_lat, p1_lng, p2_lat, p2_lng)
    {
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2_lat - p1_lat);
        var dLong = rad(p2_lng - p1_lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1_lat)) * Math.cos(rad(p2_lat)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; // returns the distance in meter
    }


    //Insertion sort function to sort the distanceValue array
    function insertionSort(array)
    {
        for (var i = 0; i < array.length; i++)
        {
            var k = array[i];
            for (var j = i; j > 0 && (k.dis < array[j - 1].dis); j--)
            {
                array[j] = array[j - 1];
            }
            array[j] = k;
        }
        return array;
    }

    //Function for get current position
    function showPosition(location)
    {
        var lat = location.coords.latitude;
        var lon = location.coords.longitude
        positionPoint = {
            "lat": lat,
            "lon": lon
        };
    }
    function errorMan()
    {
        alert('Oops; There seems to be some problem');
    }
    function getCurrentPosition()
    {
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(showPosition, errorMan);
        }
        else
        {
            alert("Your browser does not support the Geo-Location feature");
        }
    }

}