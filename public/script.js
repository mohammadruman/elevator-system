

(function () {
    var ElevatorModel, elevatorView;

    ElevatorModel = class ElevatorModel {
        constructor() {
            let floorButtons, currentFloor, self;
            this.totalFloors = 11;
            this.elevatorCompartments = [];
            this.compartmentCount = 3;
            self = this;
            floorButtons = ((function () {
                var j, floorBtns;
                floorBtns = [];
                for (currentFloor = j = self.totalFloors; j >= 1; currentFloor = j += -1) {
                    floorBtns.push(`<div id='floor-buttons-${currentFloor}' class='floor-buttons d-flex align-items-center'><div class="floor-number-container d-flex align-items-center justify-content-center"><label class="floor-number-label">${currentFloor}</label></div><button class='button upSide' data-floor='${currentFloor}'><div class='upSide'></div></button></div>`);
                }
                return floorBtns;
            })()).join('');
            $('#upDownButtons').empty().append($(floorButtons)).off('click').on('click', 'button', function () {
                $('#liftSound')[0].play();
                if ($(this).hasClass('on')) {
                    return;
                }
                $(this).toggleClass('on');
                return $(self).trigger('pressed', [
                    {
                        floor: parseInt($(this)[0].dataset.floor),
                        direction: $(this).children().hasClass('upSide') ? 'upSide' : 'downSide'
                    }
                ]);
            });
        }

        clearButton(floor, direction) {
            return $(`#floor-buttons-${floor} > button > div.${direction}`).parent().removeClass('on');
        }

        closestIdleCompartment(floor) {
            var a, compartment, closest, i, lowest, nonMoving;
            nonMoving = (function () {
                var j, len, ref, results;
                ref = this.elevatorCompartments;
                results = [];
                for (i = j = 0, len = ref.length; j < len; i = ++j) {
                    compartment = ref[i];
                    if (!compartment.moving && !compartment.inMaintenance) {
                        results.push([i + 1, Math.abs(floor - compartment.floor)]);
                    }
                }
                return results;
            }).call(this);
            closest = nonMoving.reduce(function (a, b) {
                if (a[1] <= b[1]) {
                    return a;
                } else {
                    return b;
                }
            });
            lowest = (function () {
                var j, len, results;
                results = [];
                for (j = 0, len = nonMoving.length; j < len; j++) {
                    a = nonMoving[j];
                    if (a[1] === closest[1]) {
                        results.push(a[0]);
                    }
                }
                return results;
            })();
            return lowest[Math.floor(Math.random() * lowest.length)];
        }

        moveCompartment(compartment, floor) {
            var deferred, currentCompartment;
            currentCompartment = this.elevatorCompartments;
            deferred = $.Deferred();
            if (this.elevatorCompartments[compartment - 1].moving) {
                return deferred.reject();
            }
            if (floor < 1 || floor > this.totalFloors) {
                return deferred.reject();
            }
            this.elevatorCompartments[compartment - 1].moving = true;
            $(`#lift${compartment} .compartment`).animate({
                bottom: `${(floor - 1) * 85}px`
            }, {
                //For travelling each floor we need 2 sec
                duration: 2000 * Math.abs(currentCompartment[compartment - 1].floor - floor),
                easing: 'linear',
                complete: function () {
                    currentCompartment[compartment - 1].floor = floor;
                    currentCompartment[compartment - 1].moving = false;
                    //stop the lift sound
                    $('#liftSound')[0].pause();
                    return deferred.resolve();
                }
            }).delay(50);
            $(`#lift${compartment} .compartment > div`).animate({
                top: `${-425 + floor * 85}px`
            }, {
                duration: 300 * Math.abs(currentCompartment[compartment - 1].floor - floor),
                easing: 'linear'
            }).delay(50);
            return deferred;
        }

    };

    elevatorView = new ElevatorModel();
    for (let i = 0; i < elevatorView.compartmentCount; i++) {
        elevatorView.elevatorCompartments.push({
            floor: 0,
            moving: false,
            inMaintenance: false,
        });
        let count = i;
        let dynamicCompartment = `<div id="lift${count+1}" class="elevator col d-flex justify-content-center"><div class="compartment">`;

        $('#elevators').prepend(dynamicCompartment);

        let dynamicMaintenanceMode = `<div class="col d-flex align-content-center justify-content-center maintenance-mode-item"><div class="form-check form-switch cursor-pointer"><input class="form-check-input cursor-pointer" type="checkbox" onchange="toMaintenance(${i})" /></div></div>`;

        $('.maintenance-mode-container').prepend(dynamicMaintenanceMode);
    }

    $(elevatorView).on('pressed', function (e, { floor, direction }) {
        return elevatorView.moveCompartment(elevatorView.closestIdleCompartment(floor), floor).then(function () {
            return elevatorView.clearButton(floor, direction);
        });
    });

    function toMaintenance(compartmentNumber) {
        elevatorView.elevatorCompartments[compartmentNumber].inMaintenance = !elevatorView.elevatorCompartments[compartmentNumber].inMaintenance;
        if (elevatorView.elevatorCompartments[compartmentNumber].inMaintenance) {
            $(`#lift${compartmentNumber+1} > .compartment`).css('border', '2px solid red');
        }
        else {
            $(`#lift${compartmentNumber+1} > .compartment`).css('border', 'none');
        }
        elevatorView.moveCompartment(compartmentNumber+1, 1);

        const isAllInMaintenance = elevatorView.elevatorCompartments.every((m) => m.inMaintenance === true);

        isAllInMaintenance ? $('.button').prop('disabled', true) : $('.button').prop('disabled', false);
    }
    function calculateTravelTime(currentFloor, requestedFloor) {
        const travelTimePerFloor = 2; // 2 seconds per floor
        return Math.abs (currentFloor* travelTimePerFloor);
    }
    
    function updateLiftTimes() {
        const requestedFloor = parseInt(document.getElementById('requestedFloorValue').textContent);
        
        // Current positions of lifts (you can update these values according to your elevator system)
        const lift1CurrentFloor = 0;
        const lift2CurrentFloor = 0;
        const lift3CurrentFloor = 0;
    
        // Calculate travel time for each lift
        const lift1TravelTime = calculateTravelTime(lift1CurrentFloor, requestedFloor);
        const lift2TravelTime = calculateTravelTime(lift2CurrentFloor, requestedFloor);
        const lift3TravelTime = calculateTravelTime(lift3CurrentFloor, requestedFloor);
    
        // Update displayed travel times
        document.getElementById('lift1TimeValue').textContent = lift1TravelTime + " seconds";
        document.getElementById('lift2TimeValue').textContent = lift2TravelTime + " seconds";
        document.getElementById('lift3TimeValue').textContent = lift3TravelTime + " seconds";
    }
    
    // Update lift times initially and then at regular intervals (e.g., every second)
    updateLiftTimes();
    setInterval(updateLiftTimes, 1000); // Update every second
    
}).call(this);
