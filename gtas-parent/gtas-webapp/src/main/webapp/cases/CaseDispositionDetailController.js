/*
 * All GTAS code is Copyright 2016, The Department of Homeland Security (DHS), U.S. Customs and Border Protection (CBP).
 *
 * Please see LICENSE.txt for details.
 */
(function () {
    'use strict';
    app.controller('CaseDispositionDetailCtrl',
        function ($scope, $http, $mdToast,
                  gridService,
                  spinnerService, caseDispositionService, newCases, caseService, $state, $mdSidenav) {

            $scope.caseItem;
            $scope.caseItemHits;
            $scope.caseItemHitComments;
            $scope.commentText;
            $scope.hitDispStatus;
            $scope.caseDispStatus;
            $scope.dispStatus={
                hitStatusShow:true,
                caseStatusShow:true,
                allHitsClosed:true
            };
            $scope.hitValidityStatuses=[
            {id: 1, name: 'Yes'},
            {id: 1, name: 'No'},
            {id: 1, name: 'N/A'}
            ];
            $scope.options = {
                height: 150,
                toolbar: [
                    ['style', ['bold', 'italic', 'underline', 'clear']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']]
                ]
            };
            $scope.hitDetailTrueHitFlag = false;
            $scope.caseItemHitId=null;

            $scope.changeState = function(){
                $scope.hitDetailTrueHitFlag = hitDetailTrueHitFlag;
            };

            if(typeof newCases.data !== undefined && newCases.data !== null) {
                $scope.caseItem = newCases.data.cases[0];
                $scope.caseItemHits = $scope.caseItem.hitsDispositions;
                $scope.caseDispStatus = $scope.caseItem.status;
                $scope.dispStatus.caseStatusShow = ($scope.caseItem.status === 'CLOSED')? false: true;
            }

            $scope.errorToast = function (error) {
                $mdToast.show($mdToast.simple()
                    .content(error)
                    .position('bottom left')
                    .hideDelay(4000)
                    .parent($scope.toastParent));
            };

            $scope.printCard = function(){
                var element = document.getElementById('dom-to-print');
                html2pdf(element);
        };

            caseService.getDispositionStatuses().then(function (response) {
                $scope.dispositionStatuses = response.data;
            });

            $scope.pageSize = 10;

            $scope.caseConfirm = function() {
                //check whether all the hits are CLOSED or not
                angular.forEach($scope.caseItemHits, function (item) {
                    if (item.status != 'CLOSED') $scope.dispStatus.allHitsClosed = false;
                });
                if($scope.dispStatus.allHitsClosed){
                spinnerService.show('html5spinner');
                $scope.caseDispStatus = "Case" + $scope.caseDispStatus;
                caseDispositionService.updateHitsDisposition($scope.caseItem.flightId, $scope.caseItem.paxId,
                    $scope.caseItemHitId, $scope.commentText,
                    $scope.caseDispStatus,
                    $scope.hitDetailTrueHitFlag)
                    .then(function (aCase) {
                        $scope.caseItem = aCase.data;
                        $scope.caseItemHits = $scope.caseItem.hitsDispositions;
                        $scope.caseDispStatus = $scope.caseItem.status;
                        $scope.dispStatus.caseStatusShow = false;
                        spinnerService.hide('html5spinner');
                        $mdSidenav('comments').close();
                    });// END of caseDispositionService call
            }else{
                    var toastPosition = angular.element(document.getElementById('caseForm'));
                        $mdToast.show($mdToast.simple()
                            .content("All Hits Have To Be Processed And Closed To Close This Case")
                            .position('top right')
                            .hideDelay(4000)
                            .parent(toastPosition));
                    $scope.caseItem = aCase.data;
                    $scope.caseItemHits = $scope.caseItem.hitsDispositions;
                    $scope.caseDispStatus = $scope.caseItem.status;
                }
            };

            $scope.commentConfirm = function(){
                spinnerService.show('html5spinner');
                caseDispositionService.updateHitsDisposition($scope.caseItem.flightId, $scope.caseItem.paxId,
                                                             $scope.caseItemHitId, $scope.commentText,
                    $scope.hitDispStatus,
                                                             $scope.hitDetailTrueHitFlag)
                    .then(function (aCase) {
                    $scope.caseItem = aCase.data;
                    $scope.caseItemHits = $scope.caseItem.hitsDispositions;
                    $scope.commentText=null;
                    $scope.hitDispStatus=null;
                    spinnerService.hide('html5spinner');
                    $mdSidenav('comments').close();
                });
            };

            caseService.getDispositionStatuses().then(function (response) {
                $scope.dispositionStatuses = response.data;
            });

            $scope.closeSideNav = function(){
                $mdSidenav('comments').close();
            };

            $scope.sideNav = function(id, position) {
                $scope.caseItemHitComments = $scope.caseItemHits[position];
                $scope.caseItemHitId = $scope.caseItemHits[position].hitId;
                $scope.hitDetailTrueHitFlag = $scope.caseItemHits[position].valid;
                $scope.hitDispStatus = $scope.caseItemHits[position].status;
                $scope.dispStatus.hitStatusShow = ($scope.caseItemHits[position].status === 'CLOSED')? false: true;
                if(typeof $scope.hitDetailTrueHitFlag !== undefined && $scope.hitDetailTrueHitFlag !== null) {
                    if($scope.hitDetailTrueHitFlag == 'true') $scope.hitDetailTrueHitFlag = true;
                        else if($scope.hitDetailTrueHitFlag == 'false') $scope.hitDetailTrueHitFlag = false;
                }
                $mdSidenav(id).toggle();
            }
        })
}());