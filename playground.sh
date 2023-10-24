#!/bin/bash

## List all project IDs
# gh api graphql \
#   -f query="
#   query {
#     user(login: \"andrewvaughan\") {
#       projectsV2(first: 20) {
#         nodes {
#           id
#           title
#         }
#       }
#     }
#   }"



## Lookup by title: Kanban for template-core

# gh api graphql \
#   -F title="Kanban for template-core" \
#   -F owner="andrewvaughan" \
#   -f query="
#   query(\$title:String!, \$owner:String!) {
#     user(login: \$owner) {
#       projectsV2(query: \$title, first: 1) {
#         nodes {
#           id
#           title
#         }
#       }
#     }
#   }"




## Project lookup by ID: PVT_kwHOABEVZs4AXJlu

# gh api graphql \
#   -F id="PVT_kwHOABEVZs4AXJlu" \
#   -f query="
#     query(\$id: ID!) {
#       node(id: \$id) {
#         ... on ProjectV2 {
#           fields(first: 20) {
#             nodes {
#               ... on ProjectV2FieldCommon {
#                 id
#                 name
#               }
#             }
#           }
#         }
#       }
#     }
#   "


# Lookup Project by Repository: template-core

# gh api graphql \
#   -F owner="andrewvaughan" \
#   -F repo="template-core" \
#   -F project="" \
#   -f query="
#   query(\$owner:String!, \$repo:String!, \$project:String!) {
#     repository(owner: \$owner, name: \$repo, followRenames: true) {
#       projectsV2(first: 2, query: \$project) {
#         nodes {
#           id
#           title
#           number
#           url
#         }
#       }
#     }
#   }"


# Lookup Issue Project Priority by owner, repo, and issue ID

gh api graphql \
  -F owner="andrewvaughan" \
  -F repo="template-core" \
  -F issueID=23 \
  -F field="Points" \
  -f query="
  query(\$owner:String!, \$repo:String!, \$issueID:Int!, \$field:String!) {
    repository(owner: \$owner, name: \$repo, followRenames: true) {
      issue(number: \$issueID) {
        projectItems(first: 2) {
          nodes {
            fieldValueByName(name: \$field) {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
              }
              ... on ProjectV2ItemFieldNumberValue {
                number
              }
            }
          }
        }
      }
    }
  }"





# Get Issue from project

# gh api graphql \
#   -F pid="PVT_kwHOABEVZs4AXJlu" \
#   -f query="
#   query(\$pid: ID!) {
#     node(id: \$pid) {
#       ... on ProjectV2 {
#         items(first: 20) {
#           nodes {
#             id
#             content {
#               ... on Issue {
#                 number
#                 title
#               }
#             }
#           }
#         }
#       }
#     }
#   }"
