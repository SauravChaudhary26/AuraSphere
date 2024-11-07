#include<bits/stdc++.h> 
using namespace std; 

int main()
{

    int n , k;
    cin >> n;
    cin >> k;

    vector<int> arr;

    for (int i = 0; i < n; i++)
    {
        int temp;
        cin >> temp;
        arr.push_back(temp);
    }
    if(k == n){
        cout << 0;
        return 0;
    }

    int count = 0, i = 0;

    while(k < n){
        bool sign = false;
        for (int j = i + 1; j <= k; j++)
        {
            if(arr[j-1] > 2 * arr[j]){
                sign = true;
                break;
            } 
        }

        if(!sign){
            count++;
        }
        i++;
        k++;
        
    }
    

    cout << count << endl;
    
 return 0;
}