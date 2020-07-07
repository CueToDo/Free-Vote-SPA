

// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// Model
import { Group } from '../models/group.model';
import { SubGroup, SubGroupUpdate } from '../models/sub-group.model';

// Base Services
import { HttpService } from './http.service';
import { AppDataService } from './app-data.service';

@Injectable({ providedIn: 'root' })
export class GroupsService {

    constructor(
        private httpClientService: HttpService,
        private appData: AppDataService
    ) { }

    groupsSelected: Group[];

    GroupMembership(searchTerms: string): Observable<Group[]> {

        const postData = {
            'SearchTerms': searchTerms
        };

        return this.httpClientService
            .post('groups/membership', postData)
            .pipe(
                // save copy to look up groupID in group-issues.component
                tap(returnData => this.groupsSelected = returnData as Group[]),
                map(returnData => returnData as Group[])
            );
    }

    GroupsAvailable(searchTerms: string): Observable<Group[]> {

        const postData = {
            'SearchTerms': searchTerms
        };

        return this.httpClientService
            .post('groups/available', postData)
            .pipe(
                // save copy to look up groupID in group-issues.component
                tap(returnData => this.groupsSelected = returnData as Group[]),
                map(returnData => returnData as Group[])
            );
    }

    GroupSearchByName(groupName: string): Observable<Group> {

        const postData = {
            'SearchTerms': groupName
        };

        return this.httpClientService
            .post('groups/search', postData)
            .pipe(
                // add group to saved groups
                tap(returnData => {
                    if (!this.groupsSelected) {
                        this.groupsSelected = [returnData as Group];
                    } else if (!this.groupsSelected.includes(returnData as Group)) {
                        this.groupsSelected.push(returnData as Group);
                    }
                }),
                map(returnData => returnData as Group)
            );
    }

    Join(groupID: number): Observable<number> {

        return this.httpClientService
            .get(`group/join/${groupID}`);
    }

    Leave(groupID: number): Observable<number> {

        return this.httpClientService
            .get(`group/leave/${groupID}`);
    }

    Activate(groupID: number, active: boolean): Observable<boolean> {

        return this.httpClientService
            .get(`group/activate/${groupID}/${active ? 'Y' : 'N'}`);
    }

    Update(group: Group): Observable<Group> {
        return this.httpClientService
            .post('group/update', group);
    }

    Delete(groupID: number): Observable<boolean> {
        return this.httpClientService
            .get(`group/delete/${groupID}`);
    }

    SubGroups(groupID: number): Observable<SubGroup[]> {
        return this.httpClientService
            .get(`group/subgroups/${groupID}`);
    }

    SubGroup(subGroupID: number): Observable<SubGroup> {
        return this.httpClientService
            .get(`group/subgroup/${subGroupID}`);
    }

    SubGroupByName(groupName: string, subGroupName: string): Observable<SubGroup> {
        return this.httpClientService
            .get(`group/subGroupByName/${groupName}/${subGroupName}`);
    }



    GroupID(groupName: string): number {

        // if (!this.groupsSelected || this.groupsSelected.length === 0) {
        //     return 0;
        // }

        const groupChosen = this.groupsSelected.filter(
            group => group.groupName === groupName
        );

        if (!!groupChosen && groupChosen.length === 1) {
            const groupID = groupChosen[0].groupID;
            return groupID;
        } else {
            return 0;
        }
    }

    Group(groupName: string, refresh: boolean): Observable<Group> {

        let groupsFiltered: Group[];
        let groupChosen: Group;

        if (!refresh && !!this.groupsSelected) {
            groupsFiltered = this.groupsSelected.filter(
                group => group.groupName === groupName
            );
            if (!!groupsFiltered && groupsFiltered.length === 1) {
                groupChosen = groupsFiltered[0];
            }
        }

        if (!!groupChosen) {
            return of(groupChosen);
        } else {
            return this.GroupSearchByName(groupName);
        }
    }

    SubGroupUpdate(subGroup: SubGroupUpdate): Observable<SubGroup> {
        return this.httpClientService
            .post('group/subgroup/update', subGroup);
    }

    SubGroupStartDiscussionNow(subGroupID: number): Observable<boolean> {
        return this.httpClientService
            .get(`group/subgroup/${subGroupID}/startDiscussion`);
    }


    SubGroupDelete(groupID: number, subGroupID: number): Observable<boolean> {
        return this.httpClientService
            .get(`group/${groupID}/subgroup/${subGroupID}/delete`);
    }
}
